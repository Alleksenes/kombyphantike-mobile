import React from 'react';
import { View, Text } from 'react-native';

interface ParadigmEntry {
  form: string;
  tags: string;
}

interface ParadigmGridProps {
  paradigm: ParadigmEntry[];
  highlightForm?: string; // Optional: highlight if matches this form
}

// Parse logic adapted for Nouns
const parseNounParadigm = (paradigm: ParadigmEntry[]) => {
  const rowsOrder = ['Nom', 'Gen', 'Acc', 'Voc'];
  const result: Record<string, { Singular: string; Plural: string }> = {};

  // Initialize all required rows
  rowsOrder.forEach((r) => {
    result[r] = { Singular: '-', Plural: '-' };
  });

  const casesMap: Record<string, string> = {
    nominative: 'Nom',
    genitive: 'Gen',
    accusative: 'Acc',
    vocative: 'Voc',
    // Dative is excluded as per previous logic
  };

  paradigm.forEach((entry) => {
    if (typeof entry.tags !== 'string') return;
    const tags = entry.tags.toLowerCase();
    const number = tags.includes('plural') ? 'Plural' : tags.includes('singular') ? 'Singular' : null;

    let caseLabel = null;
    for (const [key, label] of Object.entries(casesMap)) {
      if (tags.includes(key)) {
        caseLabel = label;
        break;
      }
    }

    if (number && caseLabel && result[caseLabel]) {
      result[caseLabel][number] = entry.form;
    }
  });

  return rowsOrder.map((label) => ({
    caseName: label,
    forms: result[label],
  }));
};

export default function ParadigmGrid({ paradigm, highlightForm }: ParadigmGridProps) {
  const data = parseNounParadigm(paradigm);

  return (
    <View className="p-4 rounded-xl bg-ink dark:bg-gray-800 border border-transparent dark:border-gray-700">
      <Text className="text-xs font-bold text-paper dark:text-gray-300 uppercase mb-4 tracking-widest">
        Noun Paradigm
      </Text>

      {/* Grid Header */}
      <View className="flex-row mb-2 border-b border-gray-600 dark:border-gray-700 pb-2">
        <View style={{ width: 50 }} />
        <Text className="flex-1 text-center font-bold text-gray-400 dark:text-gray-500 text-xs uppercase">Singular</Text>
        <Text className="flex-1 text-center font-bold text-gray-400 dark:text-gray-500 text-xs uppercase">Plural</Text>
      </View>

      {/* Grid Body */}
      <View>
        {data.map(({ caseName, forms }, idx) => {
          const isSingularMatch = highlightForm && forms.Singular === highlightForm;
          const isPluralMatch = highlightForm && forms.Plural === highlightForm;

          return (
            <View key={idx} className="flex-row items-center py-2 border-b border-gray-800 dark:border-gray-700 last:border-0">
              {/* Case Label */}
              <View style={{ width: 50 }}>
                <Text className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase">{caseName}</Text>
              </View>

              {/* Singular */}
              <View className="flex-1 items-center justify-center px-1">
                 <View className={`px-2 py-1 rounded ${isSingularMatch ? 'border border-gold bg-gold/20' : ''}`}>
                    <Text className={`text-base ${isSingularMatch ? 'text-gold font-bold' : 'text-paper dark:text-gray-200'}`}>
                      {forms.Singular}
                    </Text>
                 </View>
              </View>

              {/* Plural */}
              <View className="flex-1 items-center justify-center px-1">
                <View className={`px-2 py-1 rounded ${isPluralMatch ? 'border border-gold bg-gold/20' : ''}`}>
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
  );
}
