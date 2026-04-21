# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun start              # Start Expo dev server
bun run android        # Run on Android emulator
bun run ios            # Run on iOS simulator
bun run web            # Run in browser
bun run lint           # ESLint (flat config via expo)
bun run test           # Jest (jest-expo preset)
```

Single test: `bun run test -- --testPathPattern=ParadigmGrid`

## Architecture

**Kombyphantike Mobile** is a React Native/Expo app for learning Ancient and Modern Greek via an interactive "Lexical Island" curriculum. Users read annotated Greek sentences; tapping any word opens a progressive disclosure inspector showing morphology, etymology, and diachronic connections between ancient and modern forms.

**Stack**: Expo 54, React Native 0.81.5, TypeScript 5.9 (strict), expo-router (file-based routing), Zustand (state), React Native Paper + NativeWind (UI), Supabase (auth only), FastAPI (all data).

### Data Flow

- **Auth**: Supabase handles login/OAuth. JWT stored in expo-secure-store, injected as Bearer token by `ApiService`.
- **Data**: All queries go through FastAPI (`EXPO_PUBLIC_API_URL`, defaults to `http://10.0.2.2:8000` for Android / `localhost:8000` for iOS/web). No direct Supabase database queries from the client.
- **Dev bypass**: Set `EXPO_PUBLIC_DEV_MODE=true` in `.env` to skip Supabase and auto-authenticate as `scholar@kombyphantike.dev` (tier: scholar).

### Canonical Data Contract

`/src/types.ts` is the single source of truth (v0.8.2). Key types:
- **Knot**: A morphologically/etymologically annotated Greek word (the atomic unit of the app).
- **ContrastiveProfile**: Diachronic fingerprint fetched from `GET /inspect/{lemma}` — includes LSJ roots, KDS distance, paradigm, idioms, collocations, merged scholia.
- **CuratedSentenceDTO → IslandDTO → VoyageManifest**: Sentence → curriculum unit → client-side sequencer with mastery tracking.
- **Mastery**: `unseen → seen → practiced → mastered`
- **User Tier**: `'initiate'` (free) vs `'scholar'` (premium)
- **Disclosure Levels**: `translation → audio → knot → etymology` (progressive reveal in inspector)

### State Stores (`/src/store/`)

| Store | Responsibility |
|---|---|
| `authStore` | Session, user profile, tier, dev bypass |
| `voyageStore` | Persisted sentence sequencer + mastery tracking |
| `unifiedInspectorStore` | Bottom-sheet state, ContrastiveProfile cache, disclosure level |

`voyageStore` and `unifiedInspectorStore` use a **Resilient Storage** adapter that wraps AsyncStorage with an in-memory Map fallback and enforces JSON serialization before the native bridge — critical on Android Expo Go where the bridge loads late.

### Key Patterns

**Shallow Knot Adapter**: `toKnot()` in `unifiedInspectorStore` normalizes any word-like object (Token, KnotDTO, raw Knot) into a canonical `Knot`, filling missing fields with safe defaults. Use this anywhere you accept word input from routes that don't guarantee full Knot data (e.g., `orrery/`, `results`).

**Progressive Disclosure**: The PhilologicalInspector (`/components/ui/PhilologicalInspector.tsx`) uses a 4-level depth system controlled by `disclosureLevel` in `unifiedInspectorStore`. Deeper levels fetch additional data from `/inspect/{lemma}`. On web (`Platform.OS === 'web'`), the Gorhom bottom sheet is replaced with a modal overlay.

**Metro CJS Workaround**: `metro.config.js` pushes `'cjs'` to `sourceExts` to force CJS builds of Zustand middleware (avoiding un-transpiled `import.meta` on web). When adding new packages that use ESM, check for `.cjs` builds.

**Theme System**: All colors/fonts/spacing come from `/src/theme.ts` (`PhilologicalColors`, `ScriptoriumTheme`). Never declare colors inline. Key tokens: `VOID` (background black), `GOLD`, `PARCHMENT`, `INK`, `MORPH_BG`, `SCHOLIA_BG`, `ORRERY_PIGMENTS`.

### App Boot Sequence (`/app/_layout.tsx`)

1. Load fonts (GFSDidot, NeueHaasGrotesk)
2. Init SQLite
3. Show OmegaLoader
4. Mount providers: SafeAreaProvider → GestureHandlerRootView → PaperProvider → ThemeProvider(DarkTheme) → Stack
5. Mount global PhilologicalInspector overlay (bottom sheet) + dev mode overlay

### Main Routes

| Route | Purpose |
|---|---|
| `/app/index.tsx` | Shipyard — archipelago of curriculum islands |
| `/app/voyage/[id].tsx` | Lexical Array sentence reader (Duolingo-style) |
| `/app/lapidary/[sentenceId].tsx` | Semantic challenge / quiz mode |
| `/app/orrery/` | Word search + constellation graph visualization |
| `/app/login.tsx` | Supabase auth flow |
| `/app/paywall.tsx` | Premium tier gating |

### Environment Variables

```
EXPO_PUBLIC_API_URL            # FastAPI base URL
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_DEV_MODE           # Set to "true" to bypass auth
```
