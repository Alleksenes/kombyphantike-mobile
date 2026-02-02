import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ParadigmEntry {
  form: string;
  tags: string[];
}

interface ParadigmGridProps {
  paradigm: ParadigmEntry[];
  highlightForm?: string; // Optional: highlight if matches this form
  pos?: string;
}

// Helper function to find a form with specific tags
const findForm = (paradigm: ParadigmEntry[], requiredTags: string[]): string => {
  console.log("Searching for:", requiredTags, "In:", paradigm);

  const match = paradigm.find(entry => {
    if (!Array.isArray(entry.tags)) return false;
    const entryTags = entry.tags.map(t => t.toLowerCase());
    return requiredTags.every(req => entryTags.includes(req.toLowerCase()));
  });

  return match ? match.form : '-';
};

// Parse logic for Nouns
const parseNounParadigm = (paradigm: ParadigmEntry[]) => {
  const rowsOrder = [
    { label: 'Nom', tags: ['nominative'] },
    { label: 'Gen', tags: ['genitive'] },
    { label: 'Acc', tags: ['accusative'] },
    { label: 'Voc', tags: ['vocative'] },
  ];

  return rowsOrder.map((row) => ({
    label: row.label,
    forms: {
      Singular: findForm(paradigm, [...row.tags, 'singular']),
      Plural: findForm(paradigm, [...row.tags, 'plural']),
    },
  }));
};

const parseVerbParadigm = (paradigm: ParadigmEntry[]) => {
  // Structure: Tense -> Person (1,2,3) -> { Singular: string, Plural: string }
  const result: Record<string, Record<string, { Singular: string; Plural: string }>> = {
    Present: {},
    Past: {},
    Future: {}
  };

  const tenses = ['Present', 'Past', 'Future'];
  const persons = ['1', '2', '3'];
  const numbers = ['Singular', 'Plural'];

  // Map UI Tense to Backend Tags
  // Past can be 'past', 'aorist', 'imperfect', 'perfect'
  const tenseMap: Record<string, string[]> = {
    Present: ['present'],
    Future: ['future'],
  };

  const pastTenseCandidates = ['past', 'aorist', 'imperfect', 'perfect', 'pluperfect'];

  tenses.forEach(tense => {
    persons.forEach(person => {
      // Initialize
      result[tense][person] = { Singular: '-', Plural: '-' };

      numbers.forEach(number => {
        let form = '-';

        if (tense === 'Past') {
          // Iterate through candidate past tags until we find a match
          for (const pastTag of pastTenseCandidates) {
            form = findForm(paradigm, [pastTag, person, number]);
            if (form !== '-') break;
          }
        } else {
          // For Present and Future, use the mapped tag
          const tenseTag = tenseMap[tense][0]; // Assuming single tag for now
          form = findForm(paradigm, [tenseTag, person, number]);
        }

        result[tense][person][number] = form;
      });
    });
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
