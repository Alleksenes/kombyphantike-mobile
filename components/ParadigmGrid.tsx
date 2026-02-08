import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { matchTags } from '../utils/paradigm_utils';

interface ParadigmEntry {
  form: string;
  tags: string[];
}

interface ParadigmGridProps {
  paradigm: ParadigmEntry[];
  highlightForm?: string; // Optional: highlight if matches this form
  pos?: string;
}

// Helper function to find a form with specific tags using a relaxed "best match" scoring
const findForm = (paradigm: ParadigmEntry[], requiredTags: string[]): string => {
  const matchingForms = paradigm.filter(entry => {
    return matchTags(entry.tags, requiredTags);
  });

  if (matchingForms.length === 0) return '-';

  // Deduplicate forms and join
  const uniqueForms = Array.from(new Set(matchingForms.map(e => e.form)));
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
  console.log("Raw Paradigm:", JSON.stringify(paradigm, null, 2));

  // Structure: Tense -> Voice -> Person (1,2,3) -> { Singular: string, Plural: string }
  const result: Record<string, Record<string, Record<string, { Singular: string; Plural: string }>>> = {
    Present: { Active: {}, Passive: {} },
    Imperfect: { Active: {}, Passive: {} },
    Aorist: { Active: {}, Passive: {} },
    Future: { Active: {}, Passive: {} },
    Subjunctive: { Active: {}, Passive: {} },
  };

  // Define categories with their specific required tags.
  // Note: We remove 'imperfective' from Present to be more lenient,
  // as Present is the default aspect often.
  // For Imperfect and Aorist, we keep aspect to distinguish them (both are past).
  const categories = [
    { label: 'Present', tags: ['present'] },
    { label: 'Imperfect', tags: ['past', 'imperfective'] },
    { label: 'Aorist', tags: ['past', 'perfective'] },
    { label: 'Future', tags: ['future'] },
    { label: 'Subjunctive', tags: ['subjunctive'] },
  ];

  const voices = ['Active', 'Passive'];
  const persons = ['1', '2', '3'];
  const numbers = ['Singular', 'Plural'];

  categories.forEach(category => {
    // We do NOT pre-filter the paradigm here. We pass the full paradigm to findForm
    // but with more specific tags.

    voices.forEach(voice => {
      persons.forEach(person => {
        result[category.label][voice][person] = { Singular: '-', Plural: '-' };

        const personTag = person === '1' ? 'first-person' : person === '2' ? 'second-person' : 'third-person';
        const voiceTag = voice.toLowerCase();

        numbers.forEach(number => {
          // Combine category tags (Tense/Mood/Aspect) with Voice/Person/Number
          const reqTags = [...category.tags, voiceTag, personTag, number.toLowerCase()];
          result[category.label][voice][person][number] = findForm(paradigm, reqTags);
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

  const [activeTense, setActiveTense] = useState<'Present' | 'Imperfect' | 'Aorist' | 'Future' | 'Subjunctive'>('Present');
  const [activeVoice, setActiveVoice] = useState<'Active' | 'Passive'>('Active');

  // Noir-Velvet Theme: Dark card background, Gold accents, Paper text
  // We enforce a dark theme look for the card even in light mode to act as a "Boutique" element
  const containerClass = "p-4 rounded-xl bg-black/20 border border-gray-800 shadow-sm";
  const titleClass = "text-xs font-bold text-accent uppercase tracking-widest mb-4";

  // Headers
  const headerTextClass = "flex-1 text-center font-bold text-gray-500 text-[10px] uppercase tracking-wider";

  // Cells
  const rowBorderClass = "border-b border-gray-800/50";
  const labelTextClass = "text-gray-400 font-bold text-xs uppercase";
  const highlightClass = "text-accent font-bold bg-accent/10 border border-accent/30";

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
        <View className="flex-row mb-4 bg-gray-900/50 rounded-lg p-1 overflow-hidden flex-wrap">
          {['Present', 'Imperfect', 'Aorist', 'Future', 'Subjunctive'].map((tense) => (
            <TouchableOpacity
              key={tense}
              onPress={() => setActiveTense(tense as any)}
              className={`items-center py-1.5 px-2 rounded-md ${activeTense === tense ? 'bg-gray-700' : ''}`}
            >
              <Text className={`text-[9px] uppercase font-bold tracking-wider ${activeTense === tense ? 'text-accent' : 'text-gray-500'}`} numberOfLines={1}>
                {tense === 'Subjunctive' ? 'Subj' : tense}
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
                <Text className={`text-[10px] uppercase font-bold tracking-wider ${activeVoice === voice ? 'text-accent' : 'text-gray-500'}`}>
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
            const isSingularMatch = highlightForm && forms.Singular.split(', ').includes(highlightForm);
            const isPluralMatch = highlightForm && forms.Plural.split(', ').includes(highlightForm);

            return (
              <View key={person} className={`flex-row items-center py-3 ${idx < persons.length - 1 ? rowBorderClass : ''}`}>
                <View style={{ width: 40 }}>
                  <Text className={labelTextClass}>{person}</Text>
                </View>

                {/* Singular */}
                <View className="flex-1 items-center justify-center px-1">
                  <View className={`px-2 py-1.5 rounded ${isSingularMatch ? highlightClass : ''}`}>
                    <Text className={isSingularMatch ? 'text-accent font-bold font-greek text-center' : 'text-text font-greek text-center'}>
                      {forms.Singular}
                    </Text>
                  </View>
                </View>

                {/* Plural */}
                <View className="flex-1 items-center justify-center px-1">
                  <View className={`px-2 py-1.5 rounded ${isPluralMatch ? highlightClass : ''}`}>
                    <Text className={isPluralMatch ? 'text-accent font-bold font-greek text-center' : 'text-text font-greek text-center'}>
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
          const isSingularMatch = highlightForm && forms.Singular.split(', ').includes(highlightForm);
          const isPluralMatch = highlightForm && forms.Plural.split(', ').includes(highlightForm);

          return (
            <View key={idx} className={`flex-row items-center py-3 ${idx < nounData.length - 1 ? rowBorderClass : ''}`}>
              {/* Case Label */}
              <View style={{ width: 40 }}>
                <Text className={labelTextClass}>{label}</Text>
              </View>

              {/* Singular */}
              <View className="flex-1 items-center justify-center px-1">
                <View className={`px-2 py-1.5 rounded ${isSingularMatch ? highlightClass : ''}`}>
                  <Text className={isSingularMatch ? 'text-accent font-bold font-greek text-center' : 'text-text font-greek text-center'}>
                    {forms.Singular}
                  </Text>
                </View>
              </View>

              {/* Plural */}
              <View className="flex-1 items-center justify-center px-1">
                <View className={`px-2 py-1.5 rounded ${isPluralMatch ? highlightClass : ''}`}>
                  <Text className={isPluralMatch ? 'text-accent font-bold font-greek text-center' : 'text-text font-greek text-center'}>
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
