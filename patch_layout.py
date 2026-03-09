import re

with open('app/(tabs)/_layout.tsx', 'r') as f:
    content = f.read()

# Replace sceneStyle to use a dark opaque background as a workaround, or ensure that it doesn't overlap?
# Wait, "The UI is now simply a window into the Postgres/Chroma Vault. Use StyleSheet for the 'Encore Chromatic' background—it must remain the global background (zIndex: -1) throughout these transitions."
# This means the overlapping screens issue is likely due to the router keeping the previous screen alive or visible.
# Wait, `(tabs)` navigators naturally overlap if they are transparent because they are rendered side-by-side in a stack/tab view? Yes, React Navigation Tabs with transparent backgrounds show all screens stacked.
# The user instruction says: "Use StyleSheet for the "Encore Chromatic" background—it must remain the global background (zIndex: -1) throughout these transitions."
# This means we should render the CosmicBackground INSIDE the screens, or give the screens an opaque background if the instruction meant something else?
# Let's read the instructions again:
# "Use StyleSheet for the "Encore Chromatic" background—it must remain the global background (zIndex: -1) throughout these transitions. The UI is now simply a window into the Postgres/Chroma Vault."
# Memory: "Never import or render <CosmicBackground /> inside individual screens (index.tsx, constellation.tsx). Mechanics: Root Layout: CosmicBackground at zIndex: -1 with pointerEvents="none". Screens: backgroundColor: 'transparent'."
# If memory says Screens should have backgroundColor 'transparent', why are the tabs overlapping?
# In `@react-navigation/bottom-tabs`, transparent screens will overlap if the navigator isn't set up correctly, OR if `sceneContainerStyle={{ backgroundColor: 'transparent' }}` makes all tabs visible at once.
# In React Native Web / Expo, `@react-navigation/elements` uses `display: 'none'` for inactive tabs, but wait, maybe not for web?
# Actually, the user says "Use StyleSheet for the "Encore Chromatic" background—it must remain the global background (zIndex: -1) throughout these transitions."
# Wait, let's look at `components/ui/CosmicBackground.tsx` to see if it uses StyleSheet.
