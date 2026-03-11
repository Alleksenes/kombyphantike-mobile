// ── THE PHILOLOGICAL INSPECTOR SHEET ─────────────────────────────────────────
// A polished @gorhom/bottom-sheet v5 component driven by the philological
// inspector Zustand store. Slides up when a knot-word is tapped.
//
// Structure:
//   Header  —  {target_word} ➔ {lemma}
//   §1 The Davidian Note  —  Diachronic evolution narrative
//   §2 The Scholia  —  Academic citation block (left-bordered)
//
// Aesthetic: Obsidian glassmorphism — dark frosted container (rgba(20,20,25,0.85)).
// No Tailwind. Pure StyleSheet + Reanimated.

import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { usePhilologicalInspectorStore } from '../src/store/philologicalInspectorStore';

// ── Design Tokens ────────────────────────────────────────────────────────────
const GOLD = '#C5A059';
const GOLD_DIM = 'rgba(197, 160, 89, 0.15)';
const PARCHMENT = '#E3DCCB';
const GRAY_TEXT = '#9CA3AF';
const GLASS_BG = 'rgba(20, 20, 25, 0.85)';
const BORDER_DIM = 'rgba(197, 160, 89, 0.2)';
const SCHOLIA_BORDER = 'rgba(197, 160, 89, 0.4)';

// ── Custom frosted-glass background ─────────────────────────────────────────
function SheetBackground({ style }: { style?: any }) {
  return (
    <View style={[style, styles.sheetBg]}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.sheetBgOverlay} />
    </View>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function InspectorSheet() {
  const sheetRef = useRef<BottomSheet>(null);
  const { knot, isOpen, isLoading, closeInspector } =
    usePhilologicalInspectorStore();

  const snapPoints = useMemo(() => ['48%', '85%'], []);

  // React to store state
  useEffect(() => {
    if (isOpen && knot) {
      sheetRef.current?.snapToIndex(0);
    } else if (!isOpen) {
      sheetRef.current?.close();
    }
  }, [isOpen, knot]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) closeInspector();
    },
    [closeInspector],
  );

  if (!knot) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundComponent={SheetBackground}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.headerContainer}>
        {/* ── Header: target_word ➔ lemma ──────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.headerRow}>
          <Text style={styles.headerWord} numberOfLines={1}>
            {knot.text}
          </Text>
          <Text style={styles.headerArrow}> ➔ </Text>
          <Text style={styles.headerLemma} numberOfLines={1}>
            {knot.lemma}
          </Text>
        </Animated.View>

        {/* POS + morphology badges */}
        <View style={styles.badgeRow}>
          {knot.pos ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{knot.pos}</Text>
            </View>
          ) : null}
          {knot.definition ? (
            <Text style={styles.definitionText} numberOfLines={2}>
              {knot.definition}
            </Text>
          ) : null}
        </View>

        <View style={styles.divider} />
      </BottomSheetView>

      {/* ── Scrollable Body ────────────────────────────────────────────── */}
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={GOLD} />
            <Text style={styles.loaderText}>Consulting the sources...</Text>
          </View>
        ) : (
          <>
            {/* ── §1: The Davidian Note ──────────────────────────────── */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Text style={styles.sectionIconText}>D</Text>
                </View>
                <Text style={styles.sectionLabel}>The Davidian Note</Text>
              </View>
              <View style={styles.noteCard}>
                <Text style={styles.noteBody}>
                  {knot.david_note === 'Diachronic link undetermined.'
                    ? 'The diachronic bridge is currently under construction.'
                    : knot.david_note}
                </Text>
              </View>
            </Animated.View>

            {/* ── §2: The Scholia ────────────────────────────────────── */}
            <Animated.View entering={FadeInDown.duration(400).delay(250)}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, styles.sectionIconScholia]}>
                  <Text style={styles.sectionIconText}>S</Text>
                </View>
                <Text style={styles.sectionLabel}>The Scholia</Text>
              </View>
              <View style={styles.scholiaCard}>
                <View style={styles.scholiaBorder} />
                <View style={styles.scholiaInner}>
                  <Text style={styles.scholiaSource}>
                    Holton et al. — Greek: A Comprehensive Grammar
                  </Text>
                  <Text style={styles.scholiaBody}>{knot.rag_scholia}</Text>
                </View>
              </View>
            </Animated.View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Sheet chrome ──────────────────────────────────────────────────────────
  sheetBg: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: BORDER_DIM,
    backgroundColor: 'transparent',
  },
  sheetBgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: GLASS_BG,
  },
  handle: {
    backgroundColor: GOLD,
    width: 40,
    height: 4,
    borderRadius: 2,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  headerWord: {
    fontFamily: 'GFSDidot',
    fontSize: 32,
    color: PARCHMENT,
  },
  headerArrow: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 18,
    color: GOLD,
    marginHorizontal: 4,
  },
  headerLemma: {
    fontFamily: 'GFSDidot',
    fontSize: 24,
    color: GOLD,
    fontStyle: 'italic',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.8)',
  },
  badgeText: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 10,
    fontWeight: 'bold',
    color: GRAY_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  definitionText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 13,
    color: PARCHMENT,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    marginTop: 16,
  },

  // ── Scroll body ───────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 60,
    gap: 24,
  },

  // ── Loader ────────────────────────────────────────────────────────────────
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loaderText: {
    fontFamily: 'GFSDidot',
    fontSize: 14,
    color: 'rgba(197, 160, 89, 0.5)',
    fontStyle: 'italic',
  },

  // ── Section headers ───────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GOLD_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionIconScholia: {
    backgroundColor: 'rgba(120, 53, 15, 0.25)',
  },
  sectionIconText: {
    fontFamily: 'GFSDidot',
    fontSize: 16,
    color: GOLD,
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: GOLD,
  },

  // ── §1 The Davidian Note ──────────────────────────────────────────────────
  noteCard: {
    backgroundColor: 'rgba(15, 5, 24, 0.4)',
    borderWidth: 1,
    borderColor: GOLD_DIM,
    borderRadius: 14,
    padding: 20,
  },
  noteBody: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 14,
    color: PARCHMENT,
    lineHeight: 22,
  },

  // ── §2 The Scholia ────────────────────────────────────────────────────────
  scholiaCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 5, 24, 0.3)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.4)',
  },
  scholiaBorder: {
    width: 4,
    backgroundColor: SCHOLIA_BORDER,
  },
  scholiaInner: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  scholiaSource: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 9,
    fontWeight: 'bold',
    color: 'rgba(197, 160, 89, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  scholiaBody: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 13,
    color: 'rgba(227, 220, 203, 0.8)',
    lineHeight: 21,
  },
});
