// ── Index Route ──────────────────────────────────────────────────────────────
// DEV_MODE: redirect straight to the Sandbox (/dev/gallery).
// PROD: redirect to (tabs) which handles auth gating.

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/dev/gallery" />;
}
