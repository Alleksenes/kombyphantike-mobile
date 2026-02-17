import { useState, useMemo } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { ParadigmEntry, parseNounParadigm, parseVerbParadigm } from '../utils/paradigm_utils';

interface ParadigmGridProps {
  paradigm: ParadigmEntry[];
  highlightForm?: string;
  pos?: string;
}

export default function ParadigmGrid({ paradigm, highlightForm, pos }: ParadigmGridProps) {
  const isVerb = pos === 'VERB' || pos === 'AUX';

  const [activeTense, setActiveTense] = useState<'Present' | 'Imperfect' | 'Aorist' | 'Future' | 'Subjunctive'>('Present');
  const [activeVoice, setActiveVoice] = useState<'Active' | 'Passive'>('Active');

  // CRITICAL: Both hooks called unconditionally to satisfy Rules of Hooks.
  // React requires the same hooks in the same order on every render.
  const verbData = useMemo(() => parseVerbParadigm(paradigm), [paradigm]);
  const nounData = useMemo(() => parseNounParadigm(paradigm), [paradigm]);

  if (isVerb) {
    const currentData = verbData[activeTense][activeVoice];
    const persons = ['1', '2', '3'];

    return (
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Verb Paradigm</Text>
        </View>

        {/* Tense Tabs */}
        <View style={styles.tabBar}>
          {(['Present', 'Imperfect', 'Aorist', 'Future', 'Subjunctive'] as const).map((tense) => (
            <TouchableOpacity
              key={tense}
              onPress={() => setActiveTense(tense)}
              style={[styles.tab, activeTense === tense && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTense === tense && styles.tabTextActive]} numberOfLines={1}>
                {tense === 'Subjunctive' ? 'Subj' : tense}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Voice Toggle */}
        <View style={styles.voiceRow}>
          <View style={styles.voiceToggle}>
            {(['Active', 'Passive'] as const).map((voice) => (
              <TouchableOpacity
                key={voice}
                onPress={() => setActiveVoice(voice)}
                style={[styles.voiceTab, activeVoice === voice && styles.voiceTabActive]}
              >
                <Text style={[styles.voiceTabText, activeVoice === voice && styles.voiceTabTextActive]}>
                  {voice} Voice
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Grid Header */}
        <View style={styles.gridHeader}>
          <View style={styles.fixedWidthColumn} />
          <Text style={styles.headerText}>Singular</Text>
          <Text style={styles.headerText}>Plural</Text>
        </View>

        {/* Grid Body */}
        <View>
          {persons.map((person, idx) => {
            const forms = currentData[person];
            const isSingularMatch = highlightForm != null && forms.Singular.split(', ').includes(highlightForm);
            const isPluralMatch = highlightForm != null && forms.Plural.split(', ').includes(highlightForm);

            return (
              <View key={person} style={[styles.gridRow, idx < persons.length - 1 && styles.gridRowBorder]}>
                <View style={styles.fixedWidthColumn}>
                  <Text style={styles.labelText}>{person}</Text>
                </View>

                <View style={styles.cellContainer}>
                  <View style={[styles.cellInner, isSingularMatch && styles.cellHighlight]}>
                    <Text style={[styles.cellText, isSingularMatch && styles.cellTextHighlight]}>
                      {forms.Singular}
                    </Text>
                  </View>
                </View>

                <View style={styles.cellContainer}>
                  <View style={[styles.cellInner, isPluralMatch && styles.cellHighlight]}>
                    <Text style={[styles.cellText, isPluralMatch && styles.cellTextHighlight]}>
                      {forms.Plural}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // Noun Rendering
  return (
    <View style={styles.container}>
      <Text style={[styles.title, styles.titleSpacing]}>Noun Paradigm</Text>

      {/* Grid Header */}
      <View style={styles.gridHeader}>
        <View style={styles.fixedWidthColumn} />
        <Text style={styles.headerText}>Singular</Text>
        <Text style={styles.headerText}>Plural</Text>
      </View>

      {/* Grid Body */}
      <View>
        {nounData.map(({ label, forms }, idx) => {
          const isSingularMatch = highlightForm != null && forms.Singular.split(', ').includes(highlightForm);
          const isPluralMatch = highlightForm != null && forms.Plural.split(', ').includes(highlightForm);

          return (
            <View key={idx} style={[styles.gridRow, idx < nounData.length - 1 && styles.gridRowBorder]}>
              <View style={styles.fixedWidthColumn}>
                <Text style={styles.labelText}>{label}</Text>
              </View>

              <View style={styles.cellContainer}>
                <View style={[styles.cellInner, isSingularMatch && styles.cellHighlight]}>
                  <Text style={[styles.cellText, isSingularMatch && styles.cellTextHighlight]}>
                    {forms.Singular}
                  </Text>
                </View>
              </View>

              <View style={styles.cellContainer}>
                <View style={[styles.cellInner, isPluralMatch && styles.cellHighlight]}>
                  <Text style={[styles.cellText, isPluralMatch && styles.cellTextHighlight]}>
                    {forms.Plural}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 1)',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#C0A062',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  titleSpacing: {
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderRadius: 8,
    padding: 4,
    flexWrap: 'wrap',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(55, 65, 81, 1)',
  },
  tabText: {
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#C0A062',
  },
  voiceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  voiceToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderRadius: 8,
    padding: 4,
  },
  voiceTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  voiceTabActive: {
    backgroundColor: 'rgba(55, 65, 81, 1)',
  },
  voiceTabText: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#6B7280',
  },
  voiceTabTextActive: {
    color: '#C0A062',
  },
  gridHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 1)',
    paddingBottom: 8,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6B7280',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fixedWidthColumn: {
    width: 40,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  gridRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  labelText: {
    color: '#9CA3AF',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  cellContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cellInner: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  cellHighlight: {
    backgroundColor: 'rgba(192, 160, 98, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(192, 160, 98, 0.3)',
  },
  cellText: {
    color: '#E3DCCB',
    fontFamily: 'GFSDidot',
    textAlign: 'center',
  },
  cellTextHighlight: {
    color: '#C0A062',
    fontWeight: 'bold',
    fontFamily: 'GFSDidot',
    textAlign: 'center',
  },
});
