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
