import re

with open('app/island/[id].tsx', 'r') as f:
    content = f.read()

content = content.replace("const { island, loading, error, isMock } = useIslandData(islandId);", "const { island, loading, error } = useIslandData(islandId);")
content = content.replace("{isMock && <Text style={styles.mockBadge}>MOCK</Text>}", "")

with open('app/island/[id].tsx', 'w') as f:
    f.write(content)
