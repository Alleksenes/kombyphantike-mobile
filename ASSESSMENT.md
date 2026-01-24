# Kombyphantike Assessment

## Current Status vs Roadmap

### Phase 1: The Iron Core
*   **Hellenic Ingestion & LSJ Oracle:** Backend tasks (assumed complete/in-progress based on API availability).
*   **API Exposure:** **Functional.** The mobile app now connects robustly to the API, handles timeouts (up to 90s), and displays results.
*   **Performance Optimization:** **Pending.** The app relies on the backend. Frontend generation times are long (~20-40s), mitigated by the new Progress UI.
*   **Data Persistence:** **Missing.** The app is currently stateless. Closing the app loses the generated curriculum. There is no local database (SQLite) or history view.

### Phase 2: The Fluid Experience
*   **Streaming Responses (SSE):** **Missing.** The app waits for the full JSON response. Implementing this would require significant refactoring of the networking layer (`fetch` -> generic stream reader or EventSource) and the `Results` UI to handle partial data.
*   **Audio Synthesis:** **Missing.** No TTS integration exists.
*   **Smart Caching:** Backend task.

### Phase 3: The Gamified Agon
*   **Not Started.** No auth, spaced repetition, or collection features.

## Integration & "Extraction" Analysis

The user reported issues with "extracting and sending sentences to a simple website".

### Identified Gaps:
1.  **No Data Export:** The current app traps data on the screen. There is no "Share", "Copy to Clipboard", or "Export to JSON" feature. Users cannot move the generated curriculum to another tool (like a simple website, Anki, or a document).
2.  **Web Compatibility (CORS):** If the "simple website" refers to the web build of this app (`npm run web`), it requires the backend (`localhost:8000`) to explicitly allow Cross-Origin Resource Sharing (CORS) from the web origin. The logs show `OPTIONS` passing for localhost, but deployment will fail without backend changes.
3.  **UI Complexity:** The new "Philology" aesthetic is rich. If the goal was a "much simpler UI", the web build might feel too "app-like".

### Immediate Remediation (Implemented in this branch):
*   **Data Export:** A "Copy/Share" feature is being added to the Results screen to allow users to extract the text.
*   **Web Networking:** Error handling for web-specific failures (CORS) has been added.
