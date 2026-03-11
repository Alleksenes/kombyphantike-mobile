import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import CosmicBackground from '../../components/ui/CosmicBackground';
import PhilologyCard from '../../components/PhilologyCard';
import InspectorSheet from '../../components/InspectorSheet';
import { mockCuratedSentence } from '../../src/services/mock_data';
import { usePhilologicalInspectorStore } from '../../src/store/philologicalInspectorStore';
import { Knot } from '../../src/types';

export default function GalleryScreen() {
  const openInspector = usePhilologicalInspectorStore((state) => state.openInspector);

  const handleKnotPress = (knot: Knot) => {
    // We mock the token/knot handling here using the state store to avoid API calls
    openInspector(knot);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
        <CosmicBackground />
      </View>
      <View style={styles.content}>
        <PhilologyCard
          sentence={mockCuratedSentence.greek_text}
          translation={mockCuratedSentence.translation}
          knots={mockCuratedSentence.knots}
          onTokenPress={(token) => {
            // Map token to knot and press if a match is found
            const knotMatch = mockCuratedSentence.knots.find((k) => k.text === token.text);
            if (knotMatch) {
              handleKnotPress(knotMatch);
            }
          }}
        />
      </View>
      <InspectorSheet />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0518',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 1,
  },
});
