// screens/ConstellationMap.tsx
// STUB — Skia/D3 removed. Awaiting Palimpsest UI Replan (react-native-svg rebuild).
// All business logic in app/constellation.tsx is fully preserved.
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { ConstellationLink, ConstellationNode } from '../src/types';

// Preserve type exports that constellation.tsx may depend on
export type D3Node = ConstellationNode;
export type D3Link = ConstellationLink;

type Props = {
  nodes: ConstellationNode[];
  links: ConstellationLink[];
  goldenPath?: string[];
  onNodePress?: (node: ConstellationNode) => void;
  cameraTranslateX?: SharedValue<number>;
  cameraTranslateY?: SharedValue<number>;
  cameraScale?: SharedValue<number>;
};

export default function ConstellationMap({ nodes, onNodePress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Curriculum Map</Text>
      <Text style={styles.meta}>{nodes.length} nodes</Text>
      <FlatList
        data={nodes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMastered = item.status === 'mastered';
          return (
            <Pressable
              style={[styles.nodeRow, isMastered && styles.nodeRowMastered]}
              onPress={() => onNodePress?.(item)}
            >
              <Text style={styles.nodeLabel}>{item.label}</Text>
              <Text style={[styles.nodeStatus, isMastered && styles.nodeStatusMastered]}>
                {isMastered ? '◆ mastered' : item.type}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  heading: {
    fontFamily: 'GFSDidot',
    fontSize: 28,
    color: '#E3DCCB',
    marginBottom: 4,
  },
  meta: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 24,
  },
  list: {
    gap: 8,
    paddingBottom: 120,
  },
  nodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#150922',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.6)',
    borderRadius: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  nodeRowMastered: {
    borderColor: 'rgba(197, 160, 89, 0.5)',
  },
  nodeLabel: {
    fontFamily: 'GFSDidot',
    fontSize: 18,
    color: '#E3DCCB',
    flex: 1,
  },
  nodeStatus: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 9,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  nodeStatusMastered: {
    color: '#C5A059',
  },
});
