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

// Helper to find a form matching ALL required tags (case-insensitive)
const findForm = (paradigm: ParadigmEntry[], requiredTags: string[]): string => {
  console.log("Searching for:", requiredTags, "In:", paradigm);

  const normalizedRequired = requiredTags.map(t => t.toLowerCase());

  const match = paradigm.find(entry => {
    // Ensure entry.tags is an array
    if (!Array.isArray(entry.tags)) return false;

    const entryTags = entry.tags.map(t => t.toLowerCase());
    // Check if ALL required tags are present in entryTags
    const isMatch = normalizedRequired.every(req => entryTags.includes(req));

    // Log for debugging (optional, can be noisy)
    // if (isMatch) console.log("Match found:", entry.form);

    return isMatch;
  });

  if (match) {
    console.log("Found match:", match.form, "for tags:", requiredTags);
    return match.form;
  }

  return '-';
};

// Parse logic for Nouns
const parseNounParadigm = (paradigm: ParadigmEntry[]) => {
  const rowsOrder = ['Nom', 'Gen', 'Acc', 'Voc'];
  const casesMap: Record<string, string> = {
    'Nom': 'nominative',
    'Gen': 'genitive',
    'Acc': 'accusative',
    'Voc': 'vocative',
  };

  return rowsOrder.map((label) => {
    const caseTag = casesMap[label];
    return {
      label,
      forms: {
        Singular: findForm(paradigm, [caseTag, 'singular']),
        Plural: findForm(paradigm, [caseTag, 'plural']),
      },
    };
  });
};

const parseVerbParadigm = (paradigm: ParadigmEntry[]) => {
  // Structure: Tense -> Person (1,2,3) -> { Singular: string, Plural: string }
  const result: Record<string, Record<string, { Singular: string; Plural: string }>> = {
    Present: {},
    Past: {},
    Future: {}
  };

  const tenseMap: Record<string, string[]> = {
    Present: ['pres', 'present'],
    Past: ['past', 'aor', 'imp', 'perf', 'imperfect', 'aorist', 'perfect'],
    Future: ['fut', 'future'],
  };

  ['Present', 'Past', 'Future'].forEach(tense => {
    const possibleTenseTags = tenseMap[tense];

    ['1', '2', '3'].forEach(person => {
      // We need to find a form that has (One of possibleTenseTags) + Person + Number
      // Since findForm requires ALL tags, we iterate possible tense tags until we find a match

      const findForNumber = (number: string) => {
        for (const tenseTag of possibleTenseTags) {
            const form = findForm(paradigm, [tenseTag, person, number]);
            if (form !== '-') return form;
        }
        return '-';
      };

      result[tense][person] = {
        Singular: findForNumber('singular'),
        Plural: findForNumber('plural')
      };
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
