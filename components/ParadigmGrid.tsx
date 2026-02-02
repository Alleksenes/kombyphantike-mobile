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
  // console.log("Searching for:", requiredTags, "In:", paradigm);

  const matches = paradigm.filter(entry => {
    if (!Array.isArray(entry.tags)) return false;
    const entryTags = entry.tags.map(t => t.toLowerCase());
    return requiredTags.every(req => entryTags.includes(req.toLowerCase()));
  });

  if (matches.length === 0) return '-';

  // Deduplicate forms and join
  const uniqueForms = Array.from(new Set(matches.map(m => m.form)));
  return uniqueForms.join(', ');
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
  // Structure: Tense -> Voice -> Person (1,2,3) -> { Singular: string, Plural: string }
  const result: Record<string, Record<string, Record<string, { Singular: string; Plural: string }>>> = {
    Present: { Active: {}, Passive: {} },
    Imperfect: { Active: {}, Passive: {} },
    Aorist: { Active: {}, Passive: {} },
    Future: { Active: {}, Passive: {} },
  };

  const tenses = [
    { label: 'Present', tags: ['present', 'imperfective'] },
    { label: 'Imperfect', tags: ['past', 'imperfective'] },
    { label: 'Aorist', tags: ['past', 'perfective'] },
    { label: 'Future', tags: ['future'] },
  ];

  const voices = ['Active', 'Passive'];
  const persons = ['1', '2', '3'];
  const numbers = ['Singular', 'Plural'];

  tenses.forEach(tense => {
    voices.forEach(voice => {
        // Initialize person objects if not already (it is by default in result structure above but good to be safe if dynamic)

        persons.forEach(person => {
             // Initialize number object
             result[tense.label][voice][person] = { Singular: '-', Plural: '-' };

             // Tag mapping
             const personTag = person === '1' ? 'first-person' : person === '2' ? 'second-person' : 'third-person';
             const voiceTag = voice.toLowerCase();

             numbers.forEach(number => {
                 const reqTags = [...tense.tags, voiceTag, personTag, number.toLowerCase()];
                 result[tense.label][voice][person][number] = findForm(paradigm, reqTags);
             });
        });
    });
  });

  return result;
};

export default function ParadigmGrid({ paradigm, highlightForm, pos }: ParadigmGridProps) {
  // Strict POS check: Only treat as verb if explicitly tagged as VERB or AUX.
  // This ensures words like "ορίζοντας" (participle acting as noun) are treated as Nouns if their POS is NOUN.
  const isVerb = pos === 'VERB' || pos === 'AUX';

  const [activeTense, setActiveTense] = useState<'Present' | 'Imperfect' | 'Aorist' | 'Future'>('Present');
  const [activeVoice, setActiveVoice] = useState<'Active' | 'Passive'>('Active');

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
    const currentData = verbData[activeTense][activeVoice];
    const persons = ['1', '2', '3'];

    return (
      <View className={containerClass}>
        <View className="flex-row justify-between items-center mb-4">
          <Text className={titleClass.replace('mb-4', '')}>
            Verb Paradigm
          </Text>
        </View>

        {/* Tense Tabs */}
        <View className="flex-row mb-4 bg-gray-900/50 rounded-lg p-1 overflow-hidden">
          {['Present', 'Imperfect', 'Aorist', 'Future'].map((tense) => (
            <TouchableOpacity
              key={tense}
              onPress={() => setActiveTense(tense as any)}
              className={`flex-1 items-center py-1.5 rounded-md ${activeTense === tense ? 'bg-gray-700' : ''}`}
            >
              <Text className={`text-[9px] uppercase font-bold tracking-wider ${activeTense === tense ? 'text-gold' : 'text-gray-500'}`} numberOfLines={1}>
                {tense}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Voice Toggle */}
        <View className="flex-row justify-center mb-4">
            <View className="flex-row bg-gray-900/50 rounded-lg p-1">
                {['Active', 'Passive'].map((voice) => (
                    <TouchableOpacity
                        key={voice}
                        onPress={() => setActiveVoice(voice as any)}
                        className={`px-4 py-1.5 rounded-md ${activeVoice === voice ? 'bg-gray-700' : ''}`}
                    >
                        <Text className={`text-[10px] uppercase font-bold tracking-wider ${activeVoice === voice ? 'text-gold' : 'text-gray-500'}`}>
                            {voice} Voice
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
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
            const isSingularMatch = highlightForm && forms.Singular.includes(highlightForm);
            const isPluralMatch = highlightForm && forms.Plural.includes(highlightForm);

            return (
              <View key={person} className={`flex-row items-center py-3 ${idx < persons.length - 1 ? rowBorderClass : ''}`}>
                <View style={{ width: 40 }}>
                  <Text className={labelTextClass}>{person}</Text>
                </View>

                {/* Singular */}
                <View className="flex-1 items-center justify-center px-1">
                  <View className={`px-2 py-1.5 rounded ${isSingularMatch ? highlightClass : ''}`}>
                    <Text className={isSingularMatch ? 'text-gold font-bold text-center' : 'text-paper text-sm text-center'}>
                      {forms.Singular}
                    </Text>
                  </View>
                </View>

                {/* Plural */}
                <View className="flex-1 items-center justify-center px-1">
                  <View className={`px-2 py-1.5 rounded ${isPluralMatch ? highlightClass : ''}`}>
                    <Text className={isPluralMatch ? 'text-gold font-bold text-center' : 'text-paper text-sm text-center'}>
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
          const isSingularMatch = highlightForm && forms.Singular.includes(highlightForm);
          const isPluralMatch = highlightForm && forms.Plural.includes(highlightForm);

          return (
            <View key={idx} className={`flex-row items-center py-3 ${idx < nounData.length - 1 ? rowBorderClass : ''}`}>
              {/* Case Label */}
              <View style={{ width: 40 }}>
                <Text className={labelTextClass}>{label}</Text>
              </View>

              {/* Singular */}
              <View className="flex-1 items-center justify-center px-1">
                <View className={`px-2 py-1.5 rounded ${isSingularMatch ? highlightClass : ''}`}>
                  <Text className={isSingularMatch ? 'text-gold font-bold text-center' : 'text-paper text-sm text-center'}>
                    {forms.Singular}
                  </Text>
                </View>
              </View>

              {/* Plural */}
              <View className="flex-1 items-center justify-center px-1">
                <View className={`px-2 py-1.5 rounded ${isPluralMatch ? highlightClass : ''}`}>
                  <Text className={isPluralMatch ? 'text-gold font-bold text-center' : 'text-paper text-sm text-center'}>
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
