/**
 * Normalizes a tag string by converting to lowercase and mapping common variations.
 * This bridges the gap between Kaikki/Python tags and UI expectations.
 */
export function normalize(tag: string): string {
  if (!tag) return "";
  const t = String(tag).toLowerCase().trim(); // Ensure string

  // Number
  if (t === "1st" || t === "first-person") return "1";
  if (t === "2nd" || t === "second-person") return "2";
  if (t === "3rd" || t === "third-person") return "3";
  if (t === "sg" || t === "singular") return "singular";
  if (t === "pl" || t === "plural") return "plural";

  // Mood
  if (t === "ind" || t === "indicative") return "indicative";
  if (t === "sub" || t === "subj" || t === "subjunctive") return "subjunctive";
  if (t === "imp" || t === "imperative") return "imperative";
  if (t === "inf" || t === "infinitive") return "infinitive";
  if (t === "part" || t === "participle") return "participle";

  // Voice
  if (t === "act" || t === "active") return "active";
  if (t === "pass" || t === "passive") return "passive";
  if (t === "mid" || t === "middle") return "middle";

  // Tense
  if (t === "pres" || t === "present") return "present";
  if (t === "fut" || t === "future") return "future";
  // if (t === "aor" || t === "aorist" || t === "past") return "aorist"; // OLD logic conflated past/aorist
  if (t === "aor" || t === "aorist") return "aorist";
  if (t === "past") return "past";

  if (t === "perf" || t === "perfect") return "perfect";
  if (t === "impf" || t === "imperfect") return "imperfect";

  // Aspect (Crucial for Greek)
  if (t === "perf" || t === "perfective") return "perfective";
  if (t === "impf" || t === "imperfective") return "imperfective";

  // Case
  if (t === "nom" || t === "nominative") return "nominative";
  if (t === "gen" || t === "genitive") return "genitive";
  if (t === "acc" || t === "accusative") return "accusative";
  if (t === "voc" || t === "vocative") return "vocative";

  // Gender
  if (t === "masc" || t === "masculine") return "masculine";
  if (t === "fem" || t === "feminine") return "feminine";
  if (t === "neut" || t === "neuter") return "neuter";

  return t;
}

/**
 * Returns true if the form tags contain the required tags.
 * USES FUZZY SCORING.
 */
export function matchTags(formTags: any[], requiredTags: string[]): boolean {
  if (!requiredTags || requiredTags.length === 0) return true;
  if (!formTags || formTags.length === 0) return false;

  // Normalize everything
  const normForm = formTags.map(normalize);
  const normReq = requiredTags.map(normalize);

  // Check if ALL required tags are present in the form
  // We use "every" because if we ask for "1st" and "Singular", we generally want both.
  // BUT we tolerate extra tags in the form (like "imperfective" or "verb").
  
  // Special handling for Aorist vs Imperfect distinction
  // If we require "imperfect", we MUST NOT match "perfective"
  if (normReq.includes("imperfect") && normForm.includes("perfective")) return false;
  if (normReq.includes("aorist") && normForm.includes("imperfective")) return false;

  let hits = 0;
  for (const req of normReq) {
    if (normForm.includes(req)) {
      hits++;
    }
  }

  // If we are looking for specific coordinates (e.g. 1st, Sg, Present), we want high accuracy.
  // Allow 0 misses for short queries (<3 tags), 1 miss for long queries.
  const threshold = normReq.length < 3 ? normReq.length : normReq.length - 1;
  return hits >= threshold;
}

export interface ParadigmEntry {
  form: string;
  tags: string[];
}

// Helper function to find a form with specific tags using a relaxed "best match" scoring
export const findForm = (paradigm: ParadigmEntry[], requiredTags: string[]): string => {
  const matchingForms = paradigm.filter(entry => {
    return matchTags(entry.tags, requiredTags);
  });

  if (matchingForms.length === 0) {
    // Log potential mismatches to help debug tag alignment (e.g., '1st' vs '1')
    if (paradigm.length > 0) {
      console.log(`[ParadigmGrid] No match for tags: [${requiredTags.join(', ')}]`);
    }
    return '-';
  }

  // Deduplicate forms and join
  const uniqueForms = Array.from(new Set(matchingForms.map(e => e.form)));
  return uniqueForms.join(', ');
};

// Parse logic for Nouns
export const parseNounParadigm = (paradigm: ParadigmEntry[]) => {
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

export const parseVerbParadigm = (paradigm: ParadigmEntry[]) => {
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
