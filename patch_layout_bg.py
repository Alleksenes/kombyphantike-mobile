import re

with open('app/(tabs)/shipyard.tsx', 'r') as f:
    content = f.read()

# I also need to make sure Shipyard doesn't render when it's not focused so Weaver doesn't overlap on Web.
if "import { useIsFocused } from '@react-navigation/native';" not in content:
    content = content.replace("import { useRouter } from 'expo-router';", "import { useRouter } from 'expo-router';\nimport { useIsFocused } from '@react-navigation/native';")

if "const isFocused = useIsFocused();" not in content:
    content = content.replace("export default function ShipyardScreen() {", "export default function ShipyardScreen() {\n  const isFocused = useIsFocused();")

if "  if (!isFocused) return <View />;\n\n  return (" not in content:
    content = content.replace("  return (\n    <SafeAreaView", "  if (!isFocused) return <View style={{flex: 1}} />;\n\n  return (\n    <SafeAreaView")

with open('app/(tabs)/shipyard.tsx', 'w') as f:
    f.write(content)
