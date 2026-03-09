import re

with open('app/(tabs)/_layout.tsx', 'r') as f:
    content = f.read()

# Make sceneStyle opaque so the tabs don't overlap, but wait, if it's opaque, we lose the cosmic background behind the tabs.
# The user instruction said: "Use StyleSheet for the "Encore Chromatic" background—it must remain the global background (zIndex: -1) throughout these transitions. The UI is now simply a window into the Postgres/Chroma Vault."
# BUT wait, the reviewer said: "The patch introduces a severe UI regression. By setting backgroundColor: 'transparent' on the ShipyardScreen without implementing the required global background, the screen renders transparently over the previously active tab (the Weaver screen)."
# Ah! In React Navigation bottom tabs, transparent screens stack ON TOP OF EACH OTHER if you switch tabs unless you use unmountOnBlur or you give them an opaque background, OR you use `@react-navigation/elements`'s mechanism.
# But wait, if they have an opaque background, they hide the global background.
# The `app/_layout.tsx` puts `<CosmicBackground />` at `zIndex: -1`.
# Oh! The problem is that Web's `<Tabs>` rendering with React Native Web literally mounts all screens at once with absolute positioning. By default they have a white background, which hides them from each other. If we make them transparent, we see ALL tabs at once overlapping!
# So to fix it, we either need `unmountOnBlur: true` in the screenOptions, OR we can conditionally render, OR we can hide inactive tabs.
# Wait, `@react-navigation/bottom-tabs` handles hiding inactive tabs by changing their `display` or `opacity`, or they are moved off-screen.
# Let's check `app/(tabs)/_layout.tsx`:

content = content.replace("sceneStyle: { backgroundColor: 'transparent' },", "sceneStyle: { backgroundColor: 'transparent' },\n        unmountOnBlur: true,")

with open('app/(tabs)/_layout.tsx', 'w') as f:
    f.write(content)
