import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useInspectorStore } from '../../src/store/inspectorStore';

const CustomBackground = ({ style }: { style?: any }) => {
  return (
    <View style={[style, styles.backgroundContainer]}>
      <BlurView
        intensity={40}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.backgroundOverlay} />
    </View>
  );
};

export default function TheInspector() {
  const sheetRef = useRef<BottomSheet>(null);
  const { token, isOpen, close } = useInspectorStore();

  const snapPoints = useMemo(() => ['45%', '85%'], []);

  useEffect(() => {
    if (isOpen && token) {
      sheetRef.current?.snapToIndex(0);
    } else if (!isOpen) {
      sheetRef.current?.close();
    }
  }, [isOpen, token]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      close();
    }
  }, [close]);

  if (!token) return null;

  // Data Parsing
  const pos = token.pos || 'UNK';
  const tags = token.tag ? token.tag.split('|').filter(t => t !== '_') : [];

  // Ancient Root Logic
  let ancientWord = token.lemma;
  let ancientContext = "";

  if (typeof token.ancient_context === 'string') {
    ancientContext = token.ancient_context;
  } else if (token.ancient_context && typeof token.ancient_context === 'object') {
    ancientWord = token.ancient_context.greek || token.lemma;
    ancientContext = token.ancient_context.translation || "";
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1} // Start closed
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundComponent={CustomBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* 1. HEADER SECTION */}
        <View style={styles.header}>
          <Text style={styles.title}>{token.text}</Text>
          <Text style={styles.subtitle}>{token.transliteration || `/${token.text}/`}</Text>
        </View>

        {/* 2. DATA GRID */}
        <View style={styles.gridContainer}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{pos}</Text>
          </View>
          {tags.map((tag, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* 3. SEPARATOR */}
        <View style={styles.separator} />

        {/* 4. ANCIENT ROOT SECTION */}
        <View style={styles.rootSection}>
          <Text style={styles.sectionLabel}>ANCIENT ROOT</Text>
          <Text style={styles.ancientWord}>{ancientWord}</Text>
          {ancientContext ? <Text style={styles.ancientContext}>{ancientContext}</Text> : null}
        </View>

      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 5, 24, 0.85)',
  },
  handleIndicator: {
    backgroundColor: '#C5A059',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'GFSDidot',
    fontSize: 48,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 18,
    color: '#9CA3AE', // Gray-400 equivalent
    fontStyle: 'italic',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)', // Gold with low opacity
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(197, 160, 89, 0.05)',
  },
  chipText: {
    color: '#C5A059', // Gold
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  rootSection: {
    alignItems: 'flex-start',
  },
  sectionLabel: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 12,
    color: '#C5A059', // Gold
    letterSpacing: 2,
    marginBottom: 12,
  },
  ancientWord: {
    fontFamily: 'GFSDidot',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(197, 160, 89, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10, // Glow effect
  },
  ancientContext: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 14,
    color: '#9CA3AE',
    fontStyle: 'italic',
  }
});