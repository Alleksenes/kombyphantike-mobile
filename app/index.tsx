// ── ROOT ENTRY ────────────────────────────────────────────────────────────────
// Hard-redirect to the UI Sandbox while the backend is offline.
// Swap the href to '/(tabs)' when the Shipyard is ready to ship.

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/dev/gallery" />;
}
