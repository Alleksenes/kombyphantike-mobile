import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ParadigmEntry {
  form: string;
  tags: string;
}

interface ParadigmGridProps {
  paradigm: ParadigmEntry[];
  highlightForm?: string; // Optional: highlight if matches this form
  pos?: string;
}

// Parse logic for Nouns
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
    const number = (tags.includes('plural') || tags.includes('plur')) ? 'Plural'
      : (tags.includes('singular') || tags.includes('sing')) ? 'Singular' : null;

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
    label,
    forms: result[label],
  }));
};

onst parseVerbParadigm = (paradigm: ParadigmEntry[]) => {
  // Structure: Tense -> Person (1,2,3) -> { Singular: string, Plural: string }
  const result: Record<string, Record<string, { Singular: string; Plural: string }>> = {
    Present: {},
    Past: {},
    Future: {}
  };

  // Initialize rows for each tense
  ['Present', 'Past', 'Future'].forEach(tense => {
    ['1', '2', '3'].forEach(person => {
      result[tense][person] = { Singular: '-', Plural: '-' };
    });
  });

  paradigm.forEach(entry => {
    if (typeof entry.tags !== 'string') return;
    const tags = entry.tags.toLowerCase();

    // Determine Tense
    let tense = null;
    if (tags.includes('fut')) tense = 'Future';
    else if (tags.includes('past') || tags.includes('aor') || tags.includes('imp') || tags.includes('perf')) tense = 'Past';
    else if (tags.includes('pres')) tense = 'Present';

    // Fallback or skip if tense not found
    if (!tense) return;

    // Determine Person
    let person = null;
    if (tags.includes('1')) person = '1';
    else if (tags.includes('2')) person = '2';
    else if (tags.includes('3')) person = '3';

    // Determine Number
    const number = (tags.includes('plural') || tags.includes('plur')) ? 'Plural'
      : (tags.includes('singular') || tags.includes('sing')) ? 'Singular' : null;

    if (tense && person && number) {
      result[tense][person][number] = entry.form;
    }
  });

  return result;
};

export default function ParadigmGrid({ paradigm, highlightForm, pos }: ParadigmGridProps) {
  const isVerb = pos === 'VERB' || pos === 'AUX'; // 'AUX' might also be conjugated
  const [activeTense, setActiveTense] = useState<'Present' | 'Past' | 'Future'>('Present');

  // Noir-Velvet Theme: Dark card background, Gold accents, Paper text
  // We enforce a dark theme look for the card even in light mode to act as a "Boutique" element
  const containerClass = "p-4 rounded-xl bg-ink border border-gray-800 shadow-sm";
  const titleClass = "text-xs font-bold text-gold uppercase tracking-widest mb-4";

  // Headers
  const headerTextClass = "flex-1 text-center font-bold text-gray-500 text-[10px] uppercase tracking-wider";

  // Cells
  const rowBorderClass = "border-b border-gray-800/50";
  const labelTextClass = "text-gray-400 font-bold text-xs uppercase";
  const cellTextClass = "text-paper text-sm";
  const highlightClass = "text-gold font-bold bg-gold/10 border border-gold/30";

  if (isVerb) {
    const verbData = parseVerbParadigm(paradigm);
    const currentData = verbData[activeTense];
    const persons = ['1', '2', '3'];

    return (
      <View className={containerClass}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className={titleClass.replace('mb-4', '')}>
            Verb Paradigm
          </Text>
        </View>

        {/* Tense Tabs */}
        <View className="flex-row mb-4 bg-gray-900/50 rounded-lg p-1">
          {['Present', 'Past', 'Future'].map((tense) => (
            <TouchableOpacity
              key={tense}
              onPress={() => setActiveTense(tense as any)}
              className={`flex-1 items-center py-1.5 rounded-md ${activeTense === tense ? 'bg-gray-700' : ''}`}
            >
              <Text className={`text-[10px] uppercase font-bold tracking-wider ${activeTense === tense ? 'text-gold' : 'text-gray-500'}`}>
                {tense}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grid Header */}
        <View className="flex-row mb-2 border-b border-gray-800 pb-2">
          <View style={{ width: 40 }} />
          <Text className={headerTextClass}>Singular</Text>
          <Text className={headerTextClass}>Plural</Text>
        </View>

        {/* Grid Body */}
        <View>
          {persons.map((person, idx) => {
            const forms = currentData[person];
            const isSingularMatch = highlightForm && forms.Singular === highlightForm;
            const isPluralMatch = highlightForm && forms.Plural === highlightForm;

            return (
              <View key={person} className={`flex-row items-center py-3 ${idx < persons.length - 1 ? rowBorderClass : ''}`}>
                <View style={{ width: 40 }}>
                  <Text className={labelTextClass}>{person}</Text>
                </View>

                {/* Singular */}
                <View className="flex-1 items-center justify-center px-1">
                  <View className={`px-3 py-1.5 rounded ${isSingularMatch ? highlightClass : ''}`}>
                    <Text className={isSingularMatch ? 'text-gold font-bold' : cellTextClass}>
                      {forms.Singular}
                    </Text>
                  </View>
                </View>

                {/* Plural */}
                <View className="flex-1 items-center justify-center px-1">
                  <View className={`px-3 py-1.5 rounded ${isPluralMatch ? highlightClass : ''}`}>
                    <Text className={isPluralMatch ? 'text-gold font-bold' : cellTextClass}>
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
  const nounData = parseNounParadigm(paradigm);

  return (
    <View className={containerClass}>
      <Text className={titleClass}>
        Noun Paradigm
      </Text>

      {/* Grid Header */}
      <View className="flex-row mb-2 border-b border-gray-800 pb-2">
        <View style={{ width: 40 }} />
        <Text className={headerTextClass}>Singular</Text>
        <Text className={headerTextClass}>Plural</Text>
      </View>

      {/* Grid Body */}
      <View>
        {nounData.map(({ label, forms }, idx) => {
          const isSingularMatch = highlightForm && forms.Singular === highlightForm;
          const isPluralMatch = highlightForm && forms.Plural === highlightForm;

          return (
            <View key={idx} className={`flex-row items-center py-3 ${idx < nounData.length - 1 ? rowBorderClass : ''}`}>
              {/* Case Label */}
              <View style={{ width: 40 }}>
                <Text className={labelTextClass}>{label}</Text>
              </View>

              {/* Singular */}
              <View className="flex-1 items-center justify-center px-1">
                <View className={`px-3 py-1.5 rounded ${isSingularMatch ? highlightClass : ''}`}>
                  <Text className={isSingularMatch ? 'text-gold font-bold' : cellTextClass}>
                    {forms.Singular}
                  </Text>
                </View>
              </View>

              {/* Plural */}
              <View className="flex-1 items-center justify-center px-1">
                <View className={`px-3 py-1.5 rounded ${isPluralMatch ? highlightClass : ''}`}>
                  <Text className={isPluralMatch ? 'text-gold font-bold' : cellTextClass}>
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
