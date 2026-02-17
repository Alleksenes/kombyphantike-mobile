import Slider from '@react-native-community/slider';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

interface WeaverControlsProps {
  sentenceCount: number;
  setSentenceCount: (count: number) => void;
  cefLevel: string;
  setCefLevel: (level: string) => void;
  complexity: boolean;
  setComplexity: (complex: boolean) => void;
}

const CEFR_LEVELS = ['Any', 'A1-A2', 'B1-B2', 'C1-C2'];

export default function WeaverControls({
  sentenceCount,
  setSentenceCount,
  cefLevel,
  setCefLevel,
  complexity,
  setComplexity,
}: WeaverControlsProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>

        {/* Header */}
        <Text style={styles.heading}>Stele of Command</Text>

        {/* ── Dial of Scope: Slider ─────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.labelText}>Scope</Text>
            <Text style={styles.valueText}>{sentenceCount} Sentences</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={20}
            step={1}
            value={sentenceCount}
            onValueChange={setSentenceCount}
            minimumTrackTintColor="#C0A062"
            maximumTrackTintColor="rgba(197, 160, 89, 0.2)"
            thumbTintColor="#C0A062"
          />
        </View>

        {/* ── Dial of Level: Segmented Control ─────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.labelText}>Proficiency Level</Text>
          <View style={styles.segmentedControl}>
            {CEFR_LEVELS.map((level, index) => {
              const isActive = cefLevel === level;
              const isLast = index === CEFR_LEVELS.length - 1;
              return (
                <Pressable
                  key={level}
                  onPress={() => setCefLevel(level)}
                  style={[
                    styles.segment,
                    isActive && styles.segmentActive,
                    !isLast && styles.segmentBorder,
                  ]}
                >
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Dial of Complexity: Toggle ───────────────────────────── */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.labelText}>Complexity</Text>
            <Text style={styles.complexitySubLabel}>
              {complexity ? 'Complex Structures' : 'Lucid Clarity'}
            </Text>
          </View>
          <Switch
            trackColor={{ false: 'rgba(197, 160, 89, 0.2)', true: '#C0A062' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="rgba(197, 160, 89, 0.2)"
            onValueChange={setComplexity}
            value={complexity}
          />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(15, 5, 24, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.4)',
    borderRadius: 16,
    padding: 20,
  },
  heading: {
    color: '#C0A062',
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelText: {
    color: '#E3DCCB',
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 13,
    marginBottom: 10,
  },
  valueText: {
    color: '#C0A062',
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 13,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    backgroundColor: '#0f0518',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: '#C0A062',
  },
  segmentBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(197, 160, 89, 0.3)',
  },
  segmentText: {
    color: 'rgba(227, 220, 203, 0.6)',
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmentTextActive: {
    color: '#0f0518',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 160, 89, 0.15)',
  },
  complexitySubLabel: {
    color: '#C0A062',
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 11,
    marginTop: 2,
  },
});
