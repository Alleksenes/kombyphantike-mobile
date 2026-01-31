import React, { useMemo, forwardRef } from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Token } from './WordChip';

// Helper to parse paradigm tags
const parseParadigm = (paradigm: { form: string; tags: string }[]) => {
  const result: Record<string, { Singular: string; Plural: string }> = {};
  const casesMap: Record<string, string> = {
    nominative: 'Nom',
    genitive: 'Gen',
    dative: 'Dat',
    accusative: 'Acc',
    vocative: 'Voc',
  };

  paradigm.forEach((entry) => {
    const tags = entry.tags.toLowerCase();
    const number = tags.includes('plural') ? 'Plural' : tags.includes('singular') ? 'Singular' : null;

    let caseLabel = null;
    for (const [key, label] of Object.entries(casesMap)) {
      if (tags.includes(key)) {
        caseLabel = label;
        break;
      }
    }

    if (number && caseLabel) {
      if (!result[caseLabel]) {
        result[caseLabel] = { Singular: '-', Plural: '-' };
      }
      result[caseLabel][number] = entry.form;
    }
  });

  return result;
};

interface InspectorSheetProps {
  selectedToken: Token | null;
  ancientContext: string;
}

const InspectorSheet = forwardRef<BottomSheet, InspectorSheetProps>(
  ({ selectedToken, ancientContext }, ref) => {
    const { colorScheme } = useColorScheme();
    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => ['45%', '70%'], []);

    // Helper to render a badge
    const renderBadge = (label: string, isMorph: boolean = false) => (
      <View className={`px-2 py-1 rounded mr-2 ${isMorph ? 'bg-orange-100 dark:bg-orange-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <Text className={`text-xs uppercase font-bold ${isMorph ? 'text-orange-800 dark:text-orange-200' : 'text-gray-600 dark:text-gray-300'}`}>
          {label}
        </Text>
      </View>
    );

    const bgPaper = colorScheme === 'dark' ? '#232226' : '#F8F5F2';
    const indicatorColor = colorScheme === 'dark' ? '#B39DDB' : '#5D4037';

    return (
      <BottomSheet
        ref={ref}
        index={-1} // Closed by default
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: bgPaper }}
        handleIndicatorStyle={{ backgroundColor: indicatorColor }}
      >
        <BottomSheetView className="flex-1 px-6 pt-2 pb-6">
          {selectedToken ? (
            <View className="flex-1 gap-4">
              {/* Header: The Word */}
              <View>
                <Text className="text-4xl font-bold text-ink mb-1">
                  {selectedToken.text}
                </Text>
              </View>

              {/* Row 1: Badges */}
              <View className="flex-row flex-wrap">
                {selectedToken.pos && renderBadge(selectedToken.pos)}
                {/* Parse morphological tags if available (assuming tag string like "N-G-P") */}
                {selectedToken.tag && selectedToken.tag.split('-').map((t, i) => (
                  <View key={i}>{renderBadge(t, true)}</View>
                ))}
              </View>

              {/* Row 2: The Soul (Lemma) */}
              <View className="flex-row items-center border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <Text className="text-sm font-bold text-gray-500 uppercase mr-2 tracking-wider">
                  Lemma
                </Text>
                <Text className="text-2xl font-medium text-ancient font-serif">
                  {selectedToken.lemma}
                </Text>
              </View>

              {/* Row 3: The Context */}
              <View className="mt-4 p-4 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100/50 dark:border-yellow-700/30">
                <Text className="text-xs font-bold text-gold uppercase mb-2 tracking-widest">
                  Context
                </Text>
                <Text className="text-lg text-ancient italic font-serif leading-7">
                  {ancientContext}
                </Text>
              </View>

              {/* Row 4: Paradigm (If Available) */}
              {selectedToken.has_paradigm && selectedToken.paradigm && (
                <View className="mt-4 p-4 rounded-xl bg-ink dark:bg-gray-800 border border-transparent dark:border-gray-700">
                  <Text className="text-xs font-bold text-paper dark:text-gray-300 uppercase mb-4 tracking-widest">
                    Paradigm
                  </Text>

                  {/* Grid Header */}
                  <View className="flex-row mb-2 border-b border-gray-600 dark:border-gray-700 pb-2">
                    <View style={{ width: 50 }} />
                    <Text className="flex-1 text-center font-bold text-gray-400 dark:text-gray-500 text-xs uppercase">Singular</Text>
                    <Text className="flex-1 text-center font-bold text-gray-400 dark:text-gray-500 text-xs uppercase">Plural</Text>
                  </View>

                  {/* Grid Body */}
                  <View>
                    {Object.entries(parseParadigm(selectedToken.paradigm)).map(([caseName, forms], idx) => {
                      const isSingularMatch = forms.Singular === selectedToken.text;
                      const isPluralMatch = forms.Plural === selectedToken.text;

                      return (
                        <View key={idx} className="flex-row items-center py-2 border-b border-gray-800 dark:border-gray-700 last:border-0">
                          {/* Case Label */}
                          <View style={{ width: 50 }}>
                            <Text className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase">{caseName}</Text>
                          </View>

                          {/* Singular */}
                          <View className="flex-1 items-center justify-center px-1">
                             <View className={`px-2 py-1 rounded ${isSingularMatch ? 'border border-gold bg-gold/10' : ''}`}>
                                <Text className={`text-base ${isSingularMatch ? 'text-gold font-bold' : 'text-paper dark:text-gray-200'}`}>
                                  {forms.Singular}
                                </Text>
                             </View>
                          </View>

                          {/* Plural */}
                          <View className="flex-1 items-center justify-center px-1">
                            <View className={`px-2 py-1 rounded ${isPluralMatch ? 'border border-gold bg-gold/10' : ''}`}>
                                <Text className={`text-base ${isPluralMatch ? 'text-gold font-bold' : 'text-paper dark:text-gray-200'}`}>
                                  {forms.Plural}
                                </Text>
                             </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          ) : (
             <View className="flex-1 justify-center items-center">
                <Text className="text-gray-400">Select a word to inspect</Text>
             </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

InspectorSheet.displayName = 'InspectorSheet';

export default InspectorSheet;
