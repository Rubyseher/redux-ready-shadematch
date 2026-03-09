# ShadeMatch — Application Overview

A comprehensive technical overview of the ShadeMatch application, covering architecture, authentication, data flow, and React-specific implementation details.

---

## 🏗️ Architecture & Big Picture

### How does the frontend talk to the backend?

ShadeMatch is primarily a **client-side application** — there is no traditional Node/Express backend server. The architecture consists of:

1. **React SPA (Frontend)** — Handles all UI rendering, image processing, and color analysis directly in the browser using HTML5 Canvas APIs.
2. **Firebase (Authentication Backend)** — Provides authentication services (email/password, Google OAuth). The frontend communicates with Firebase via the Firebase SDK over HTTPS.
3. **Google Gemini API (AI Backend)** — When configured, the frontend calls the Gemini API directly using the `@google/generative-ai` SDK to generate AI-powered outfit color suggestions. This is a client-side API call.
4. **No REST API / No Express Server** — Color analysis, cloth type detection, and rule-based suggestions all run entirely in the browser. There is no custom backend server.

```
┌──────────────────────────────────────────────┐
│                   Browser                     │
│                                               │
│  ┌─────────────┐  ┌───────────────────────┐  │
│  │  React SPA   │  │  Canvas Color Analysis│  │
│  │  (Vite)      │  │  (runs in browser)    │  │
│  └──────┬───────┘  └───────────────────────┘  │
│         │                                     │
└─────────┼─────────────────────────────────────┘
          │
    ┌─────┴──────┐
    │            │
    ▼            ▼
┌────────┐  ┌──────────┐
│Firebase│  │Google    │
│Auth    │  │Gemini API│
│(BaaS)  │  │(AI)      │
└────────┘  └──────────┘
```

### Why React for the frontend?

- **Component-based architecture** — Perfect for building reusable UI cards (color suggestions, shopping links, detection results).
- **Rich ecosystem** — Libraries like Redux Toolkit, React Router, TanStack Query, and shadcn/ui accelerate development.
- **TypeScript support** — Strong typing across the entire codebase reduces bugs and improves developer experience.
- **Vite as build tool** — Lightning-fast HMR and optimized production builds.

> **Note:** We do NOT use Node/Express for the backend. Firebase handles auth, and all other logic runs client-side. This was a deliberate choice to keep the app **free to host** (static site deployment) and **independent of any paid backend service**.

### Project Structure (Folder Structure & Separation of Concerns)

```
src/
├── components/           # Reusable UI components
│   ├── ui/               # shadcn/ui base components (Button, Card, Dialog, etc.)
│   ├── ColorSuggestionCard.tsx   # Individual color suggestion display
│   ├── DetectionResult.tsx       # Shows detected cloth type & color
│   ├── GenderSelector.tsx        # Men/Women toggle
│   ├── ImageDropZone.tsx         # Drag & drop image upload
│   ├── ShoppingLinks.tsx         # Shopping store links
│   ├── ThemeToggle.tsx           # Dark/Light mode toggle
│   └── UserMenu.tsx              # Auth menu (Sign In / User avatar)
│
├── contexts/             # React Context providers
│   └── AuthContext.tsx    # Firebase auth state provider
│
├── hooks/                # Custom React hooks
│   ├── use-mobile.tsx    # Mobile breakpoint detection
│   └── use-toast.ts      # Toast notification hook
│
├── lib/                  # Core business logic & utilities
│   ├── colorAnalysis.ts  # Color extraction, cloth detection, rule-based combos
│   ├── geminiService.ts  # Google Gemini AI integration
│   ├── firebase.ts       # Firebase initialization & auth functions
│   ├── config.ts         # App configuration (reads from env vars)
│   └── utils.ts          # Utility functions (cn, etc.)
│
├── pages/                # Route-level page components
│   ├── Index.tsx          # Main app page
│   ├── Auth.tsx           # Login/Signup page
│   └── NotFound.tsx       # 404 page
│
├── store/                # Redux Toolkit state management
│   ├── store.ts           # Store configuration
│   ├── hooks.ts           # Typed useDispatch/useSelector
│   ├── colorProfileSlice.ts    # Color profile state
│   └── outfitHistorySlice.ts   # Outfit history state
│
├── App.tsx               # Root component with providers & routing
├── main.tsx              # Entry point
└── index.css             # Global styles & design tokens
```

**Separation of Concerns:**
- `lib/` — Pure business logic, zero UI dependencies. Can be unit tested independently.
- `components/` — Presentational components, receive data via props.
- `pages/` — Route-level orchestrators that wire together components and logic.
- `store/` — Centralized state management, decoupled from UI.
- `contexts/` — Cross-cutting concerns (auth state).

---

## 🔐 Authentication

### How does authentication work?

Authentication is handled entirely by **Firebase Authentication**. We support:

1. **Email/Password** — `createUserWithEmailAndPassword()` and `signInWithEmailAndPassword()` from Firebase SDK.
2. **Google OAuth** — `signInWithPopup()` using `GoogleAuthProvider`.

Firebase uses **JWT-based ID tokens** internally. When a user signs in, Firebase issues an ID token that is:
- Automatically managed by the Firebase SDK
- Stored in **IndexedDB** by the Firebase SDK (not manually in localStorage)
- Automatically refreshed before expiration

> We do NOT manually handle JWTs. Firebase SDK abstracts all token lifecycle management.

**Relevant code:** `src/lib/firebase.ts`

### Where is the token stored on the frontend?

Firebase SDK stores auth tokens in **IndexedDB** (browser storage), not localStorage or cookies. This is:
- ✅ More secure than localStorage (not accessible via simple `window.localStorage`)
- ✅ Persistent across page refreshes
- ✅ Automatically managed — no manual token handling needed

We never read or manipulate the token directly. We only observe the auth state:

```typescript
// src/contexts/AuthContext.tsx
onAuthStateChanged(auth, (user) => {
  setUser(user);    // Firebase gives us the User object
  setLoading(false);
});
```

### How do you protect routes on the backend?

**Not applicable.** We don't have a custom backend server. Firebase handles auth validation internally. If we were to add protected API endpoints (e.g., via Firebase Cloud Functions), we would use Firebase Admin SDK to verify ID tokens server-side.

### How do you protect routes on the frontend?

Currently, the app uses **conditional rendering** rather than route-level protection:

- The main page (`/`) is accessible to all users (both authenticated and unauthenticated).
- Authenticated-only features (like saving outfits) show a **"Sign Up Free" prompt** instead of blocking access.
- The auth page (`/auth`) redirects to `/` after successful login.

```typescript
// In Index.tsx — conditional UI based on auth state
{selectedSuggestion && !user && (
  <div>
    <Lock /> Save this outfit combo?
    <button onClick={() => navigate("/auth")}>Sign Up Free</button>
  </div>
)}
```

If full route protection were needed, we would wrap routes with a `ProtectedRoute` component:
```typescript
// Example (not currently implemented, but ready to add)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/auth" />;
  return children;
};
```

### What happens when a token expires?

Firebase SDK **automatically refreshes tokens** before they expire (tokens last ~1 hour). The `onAuthStateChanged` listener in `AuthContext.tsx` always reflects the current auth state. We don't need to handle refresh manually.

### How do you handle logout?

```typescript
// src/lib/firebase.ts
export const logout = () => {
  if (!auth) throw new Error("Firebase not configured");
  return signOut(auth);  // Firebase clears tokens from IndexedDB
};
```

On logout:
1. `signOut(auth)` is called — Firebase SDK clears all stored tokens from IndexedDB.
2. `onAuthStateChanged` fires with `null` — our `AuthContext` updates `user` to `null`.
3. All components re-render with unauthenticated state.

There is **no server-side session invalidation** because Firebase tokens are stateless JWTs. If server-side invalidation were needed, Firebase Admin SDK's `revokeRefreshTokens()` could be used.

---

## 📡 API & Data Flow

### How do you make API calls from React?

We use **two different approaches** depending on the service:

1. **Firebase SDK** (for auth) — Direct SDK method calls, not HTTP requests:
   ```typescript
   signInWithEmailAndPassword(auth, email, password);
   signInWithPopup(auth, googleProvider);
   ```

2. **Google Gemini AI** (for outfit suggestions) — Via the `@google/generative-ai` SDK:
   ```typescript
   const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
   const result = await model.generateContent(prompt);
   ```

3. **No fetch/axios needed** — Since there's no custom REST API, we don't use fetch or axios for API calls. TanStack Query (`@tanstack/react-query`) is available in the project for future server-state management if needed.

### How do you handle loading states and errors?

Loading and error states are managed via **React local state**:

```typescript
// In Index.tsx
const [isAiLoading, setIsAiLoading] = useState(false);

// In Auth.tsx
const [loading, setLoading] = useState(false);

// Error handling with toast notifications
try {
  await signInWithGoogle();
  toast({ title: "Signed in with Google!" });
} catch (err: any) {
  toast({
    title: "Error",
    description: err.message || "Google sign-in failed",
    variant: "destructive",
  });
}
```

The AI loading state shows a dedicated loading UI:
```tsx
{isAiLoading && (
  <div>
    <Brain className="animate-pulse" />
    AI is analyzing your outfit...
  </div>
)}
```

### Walk me through what happens end-to-end when a user uploads an image

1. **User drops/selects an image** → `ImageDropZone.tsx` creates an `HTMLImageElement` from the file.
2. **Color extraction** → `extractDominantColor()` in `colorAnalysis.ts` draws the image on a hidden `<canvas>`, samples pixels, skips background colors, averages RGB, converts to HSL, and maps to a named color (e.g., "Navy Blue").
3. **Cloth type detection** → `detectClothType()` uses the image's aspect ratio as a heuristic (wide = t-shirt, tall = pants).
4. **Suggestion generation** →
   - If Gemini API key is configured: `getAIColorSuggestions()` sends a prompt to Google Gemini asking for 6 complementary items with color names and hex codes.
   - If not configured: `getColorCombinations()` uses a hardcoded lookup table of color combos.
5. **Suggestions rendered** → Each suggestion appears as a `ColorSuggestionCard` with the color swatch, name, and item type.
6. **User clicks a suggestion** → `ShoppingLinks` generates search URLs for Amazon India, Myntra, and Flipkart.

### How do you handle form validation?

**Frontend only** (since there's no backend):

- The Auth form uses **HTML5 native validation** (`required`, `type="email"`, `minLength={6}`).
- `zod` and `react-hook-form` are installed and available for more complex validation if needed.
- Firebase provides **server-side validation** for auth (e.g., duplicate email, weak password) which we surface via error toasts.

---

## 🗄️ Backend / Node Specific

### What does your middleware chain look like?

**Not applicable.** There is no Express/Node backend. All logic runs client-side.

### How do you structure your Express routes and controllers?

**Not applicable.** No Express server exists in this project.

### How is data stored?

Currently, data is stored in two ways:

1. **Redux Store (in-memory)** — Color profiles and outfit history are managed in Redux Toolkit slices. This data is lost on page refresh.
   - `colorProfileSlice.ts` — Stores skin tone, undertone, extracted colors, season.
   - `outfitHistorySlice.ts` — Stores past outfit entries with colors, category, timestamps.

2. **Firebase (auth only)** — User accounts and auth tokens are persisted by Firebase in IndexedDB.

3. **localStorage** — Used only for theme preference (dark/light mode) via `ThemeToggle.tsx`.

> **Why no database?** The app is designed to be **free and self-contained**. Adding a database would require a paid backend service. If persistence is needed in the future, Firebase Firestore or localStorage could be added.

### How do you handle errors globally?

**Not applicable** (no Express server). On the frontend, errors are handled with:
- `try/catch` blocks around async operations
- `sonner` and `use-toast` for user-facing error notifications
- `console.error` for developer debugging
- The Gemini service has a **graceful fallback** — if the AI call fails, it falls back to rule-based suggestions without showing an error.

---

## ⚛️ React Specific

### How do you manage global state?

We use **two systems** for different concerns:

1. **React Context** (`AuthContext`) — For authentication state. Simple, low-frequency updates (login/logout), so Context is perfect here.

2. **Redux Toolkit** — For application state (color profiles, outfit history). Redux was chosen because:
   - It provides **predictable state updates** via reducers.
   - `createSlice` reduces boilerplate.
   - DevTools support for debugging state changes.
   - Scales better than Context for complex state.

```typescript
// src/store/store.ts
export const store = configureStore({
  reducer: {
    colorProfile: colorProfileReducer,
    outfitHistory: outfitHistoryReducer,
  },
});
```

### How do you share auth state across components?

Via **React Context + `useAuth()` hook**:

```typescript
// Any component can access auth state:
const { user, loading, firebaseReady } = useAuth();

if (user) {
  // Show user avatar, enable save feature
} else {
  // Show "Sign In" button, show upgrade prompts
}
```

The `AuthProvider` wraps the entire app in `App.tsx`, so every component has access.

### Did you face any re-render or performance issues?

Yes, and here's how they were handled:

1. **`useCallback` for handlers** — Image processing and gender change handlers are wrapped in `useCallback` to prevent unnecessary re-creation:
   ```typescript
   const handleImageLoad = useCallback(async (img: HTMLImageElement) => {
     // ...heavy image processing
   }, [gender, fetchAISuggestions]);
   ```

2. **Canvas processing optimization** — The color extraction samples every 4th pixel (`i += 16` in the data array) instead of every pixel, reducing processing time by ~75% with minimal accuracy loss.

3. **Conditional rendering** — Sections (detection result, suggestions, shopping links) only render when their data exists, avoiding unnecessary DOM nodes.

4. **Lazy state updates** — AI suggestions use a single state update after the full response arrives, rather than streaming partial updates.

---

## 📦 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 + TypeScript | UI rendering |
| Build Tool | Vite | Dev server & bundling |
| Styling | Tailwind CSS + shadcn/ui | Design system |
| State Management | Redux Toolkit + React Context | App state + Auth state |
| Authentication | Firebase Auth | Email/password + Google OAuth |
| AI | Google Gemini API | Smart outfit suggestions |
| Image Processing | HTML5 Canvas API | Color extraction (client-side) |
| Routing | React Router v6 | SPA navigation |
| PWA | vite-plugin-pwa | Installable web app |
| Dark Mode | CSS variables + localStorage | Theme switching |

---

## 🚀 Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your keys:
   - `VITE_FIREBASE_*` — Get from Firebase Console
   - `VITE_GEMINI_API_KEY` — Get from [Google AI Studio](https://aistudio.google.com/apikey) (free)
   - `VITE_APP_NAME` — Your app name (default: ShadeMatch)
3. `npm install`
4. `npm run dev`

The app works without any API keys — it just uses rule-based suggestions instead of AI, and auth features are disabled.
