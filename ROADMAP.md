# Kombyphantike Mobile Roadmap: The Interface

> *"The Garden of Ivy."*

This roadmap defines the user experience (UX) and technical milestones for the React Native (Expo) application. The goal is to build a tool that feels like a "Digital Palimpsest."

## Phase 1: The Blueprint Architecture (Current Focus)
*Objective: To stabilize the user flow and handle API latency gracefully.*

- [x] **Basic Connectivity:** Connect to the Python API (handling CORS and timeouts).
- [ ] **The Two-Step Flow:**
    - **Screen 1 (The Draft):** Call `/draft_curriculum` to instantly display words and Ancient Context.
    - **Screen 2 (The Weave):** Auto-trigger `/fill_curriculum` to generate sentences in the background while the user studies the Draft.
- [ ] **Local Persistence:**
    - Implement `AsyncStorage` to save the history of generated "Scrolls."
    - Create a "History" tab to review past sessions offline.

## Phase 2: The Alchemical Inspection (The Core UX)
*Objective: To turn static text into an interactive laboratory.*

- [ ] **The Interactive Sentence:**
    - Replace text strings with a `WrapView` of `WordChip` components (based on backend Tokenization).
    - **Visuals:** "Hero Words" (focus of the lesson) have a subtle underglow.
- [ ] **The Inspector (Bottom Sheet):**
    - Implement a slide-up panel triggered by tapping a word.
    - **Tab A (The Anatomy):** Displays the Grammar Knot (Rule) active for this word.
    - **Tab B (The Soul):** Displays the Etymology and the "Jewel" Citation (Sophocles/Homer).
    - **Tab C (The Family):** Displays the interactive Declension Table (Paradigm).

## Phase 3: The Noble Economy (Monetization)
*Objective: To sustain the project without degrading the experience.*

- [ ] **The "Scholar's Gate" System:**
    - Implement logic for Free vs. Premium tiers.
    - **Free:** 3 Curriculums/Day. "Light" Inspector.
    - **Premium:** Unlimited. "Deep" Inspector (Full Paradigms, Audio).
- [ ] **Ad Integration:**
    - Insert non-intrusive banner ads (AdMob) *only* during the "Weaving" loading state (turning wait time into value).
- [ ] **RevenueCat Integration:** Manage subscriptions and in-app purchases.

## Phase 4: Polish & Audio
- [ ] **Typography Overhaul:** Implement *Gentium Plus* for Ancient Greek and *Inter* for Modern Greek to visually distinguish the eras.
- [ ] **Audio Playback:** Connect to the Backend TTS endpoint to play sentence audio on tap.