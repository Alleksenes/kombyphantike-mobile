// ── THE MOCK DATA FALLBACK ────────────────────────────────────────────────────
// Exact JSON output from our synthesis test. This keeps the UI fully functional
// for design and refinement while we battle the Supabase network war.

import { CuratedSentenceDTO, IslandDTO } from '../types';

export const MOCK_SENTENCES: CuratedSentenceDTO[] = [
  {
    id: 'cs-001',
    greek_text: 'πάντα ῥεῖ καὶ οὐδὲν μένει.',
    translation: 'Everything flows and nothing remains.',
    source: 'Heraclitus, Fragment 91 (via Plato, Cratylus 402a)',
    level: 'A2',
    knots: [
      {
        id: 'k-001-1',
        text: 'πάντα',
        lemma: 'πᾶς',
        pos: 'ADJ',
        tag: 'Case=Acc|Gender=Neut|Number=Plur',
        transliteration: 'pánta',
        morphology: 'Accusative Neuter Plural',
        definition: 'all, every, the whole',
        david_note:
          'The adjective πᾶς is one of the most versatile words in Greek. In the neuter plural accusative (πάντα), it functions substantively — "all things" or "everything." This is the classic Heraclitean usage where the cosmos itself is the subject. The form descends from Proto-Indo-European *pant- (cf. Latin omnis via a different root). In Modern Greek, πάντα survives as the adverb "always" — a semantic narrowing from "all things" to "at all times."',
        rag_scholia:
          'Holton et al., Greek: A Comprehensive Grammar (2012), §4.3.2: "πᾶς, πᾶσα, πᾶν is declined as a third-declension adjective with first-declension feminine forms. The neuter plural πάντα frequently serves as a substantive pronoun meaning \'everything.\' The accusative plural is the most common form in philosophical texts."',
        has_paradigm: true,
        paradigm: [
          { form: 'πᾶς', tags: ['nominative', 'singular', 'masculine'] },
          { form: 'πᾶσα', tags: ['nominative', 'singular', 'feminine'] },
          { form: 'πᾶν', tags: ['nominative', 'singular', 'neuter'] },
          { form: 'παντός', tags: ['genitive', 'singular', 'masculine'] },
          { form: 'πάσης', tags: ['genitive', 'singular', 'feminine'] },
          { form: 'παντός', tags: ['genitive', 'singular', 'neuter'] },
          { form: 'παντί', tags: ['dative', 'singular', 'masculine'] },
          { form: 'πάσῃ', tags: ['dative', 'singular', 'feminine'] },
          { form: 'παντί', tags: ['dative', 'singular', 'neuter'] },
          { form: 'πάντα', tags: ['accusative', 'singular', 'masculine'] },
          { form: 'πᾶσαν', tags: ['accusative', 'singular', 'feminine'] },
          { form: 'πᾶν', tags: ['accusative', 'singular', 'neuter'] },
          { form: 'πάντες', tags: ['nominative', 'plural', 'masculine'] },
          { form: 'πᾶσαι', tags: ['nominative', 'plural', 'feminine'] },
          { form: 'πάντα', tags: ['nominative', 'plural', 'neuter'] },
          { form: 'πάντων', tags: ['genitive', 'plural', 'masculine'] },
          { form: 'πάντων', tags: ['genitive', 'plural', 'neuter'] },
          { form: 'πάντας', tags: ['accusative', 'plural', 'masculine'] },
          { form: 'πάσας', tags: ['accusative', 'plural', 'feminine'] },
          { form: 'πάντα', tags: ['accusative', 'plural', 'neuter'] },
        ],
      },
      {
        id: 'k-001-2',
        text: 'ῥεῖ',
        lemma: 'ῥέω',
        pos: 'VERB',
        tag: 'Mood=Ind|Number=Sing|Person=3|Tense=Pres|Voice=Act',
        transliteration: 'rheî',
        morphology: '3rd Person Singular Present Active Indicative',
        definition: 'to flow, to stream, to run',
        david_note:
          'ῥέω ("to flow") is the verb that made Heraclitus immortal. The 3rd person singular present ῥεῖ captures the eternal continuous present — the river that is always flowing. This root gives us English "rheo-" (rheology, rheostat) and "rhythm" (ῥυθμός, originally "measured flow"). In Modern Greek, the verb ρέω/ρεύω survives in the compound ρεύμα ("current, stream, electricity") — the Heraclitean flow literally powers the modern world.',
        rag_scholia:
          'Holton et al., Greek: A Comprehensive Grammar (2012), §6.2.1: "Contract verbs in -εω follow predictable contraction patterns. The present indicative active 3rd singular contracts -εει to -εῖ. The verb ῥέω belongs to the class of athematic verbs in earlier Greek but was regularized into the -εω contract pattern by the Koine period."',
        has_paradigm: true,
        paradigm: [
          { form: 'ῥέω', tags: ['1st', 'singular', 'present', 'active'] },
          { form: 'ῥεῖς', tags: ['2nd', 'singular', 'present', 'active'] },
          { form: 'ῥεῖ', tags: ['3rd', 'singular', 'present', 'active'] },
          { form: 'ῥέομεν', tags: ['1st', 'plural', 'present', 'active'] },
          { form: 'ῥεῖτε', tags: ['2nd', 'plural', 'present', 'active'] },
          { form: 'ῥέουσι', tags: ['3rd', 'plural', 'present', 'active'] },
          { form: 'ἔρρεον', tags: ['1st', 'singular', 'imperfect', 'active'] },
          { form: 'ἔρρεες', tags: ['2nd', 'singular', 'imperfect', 'active'] },
          { form: 'ἔρρεε', tags: ['3rd', 'singular', 'imperfect', 'active'] },
          { form: 'ἐρρύην', tags: ['1st', 'singular', 'aorist', 'passive'] },
          { form: 'ἐρρύης', tags: ['2nd', 'singular', 'aorist', 'passive'] },
          { form: 'ἐρρύη', tags: ['3rd', 'singular', 'aorist', 'passive'] },
        ],
      },
      {
        id: 'k-001-3',
        text: 'οὐδὲν',
        lemma: 'οὐδείς',
        pos: 'ADJ',
        tag: 'Case=Nom|Gender=Neut|Number=Sing',
        transliteration: 'oudèn',
        morphology: 'Nominative Neuter Singular',
        definition: 'nothing, not one, no one',
        david_note:
          'οὐδείς is a compound of οὐδέ ("not even") + εἷς ("one") — literally "not even one." The neuter form οὐδέν gives us the philosophical concept of nothingness. This word stands in dramatic antithesis to πάντα in Heraclitus: everything (πάντα) flows, nothing (οὐδέν) stays. The rhetorical power lies in this polarity. In Modern Greek, the form τίποτα (from τι ποτε, "whatever") replaced οὐδέν in everyday speech, but ουδέν survives in formal registers and the phrase "ουδέν σχόλιον" (no comment).',
        rag_scholia:
          'Holton et al., Greek: A Comprehensive Grammar (2012), §5.7.4: "The negative pronoun οὐδείς, οὐδεμία, οὐδέν (\'no one, nothing\') is declined like εἷς, μία, ἕν with the prefix οὐδ-. The neuter singular οὐδέν is the most frequent form in philosophical and scientific prose, often functioning as the subject of impersonal constructions."',
        has_paradigm: true,
        paradigm: [
          { form: 'οὐδείς', tags: ['nominative', 'singular', 'masculine'] },
          { form: 'οὐδεμία', tags: ['nominative', 'singular', 'feminine'] },
          { form: 'οὐδέν', tags: ['nominative', 'singular', 'neuter'] },
          { form: 'οὐδενός', tags: ['genitive', 'singular', 'masculine'] },
          { form: 'οὐδεμιᾶς', tags: ['genitive', 'singular', 'feminine'] },
          { form: 'οὐδενός', tags: ['genitive', 'singular', 'neuter'] },
          { form: 'οὐδένα', tags: ['accusative', 'singular', 'masculine'] },
          { form: 'οὐδεμίαν', tags: ['accusative', 'singular', 'feminine'] },
          { form: 'οὐδέν', tags: ['accusative', 'singular', 'neuter'] },
        ],
      },
      {
        id: 'k-001-4',
        text: 'μένει',
        lemma: 'μένω',
        pos: 'VERB',
        tag: 'Mood=Ind|Number=Sing|Person=3|Tense=Pres|Voice=Act',
        transliteration: 'ménei',
        morphology: '3rd Person Singular Present Active Indicative',
        definition: 'to stay, to remain, to abide, to wait',
        david_note:
          'μένω ("to remain, to stay") is the philosophical counterpoint to ῥέω in this fragment. While ῥεῖ asserts cosmic flux, μένει — negated by οὐδέν — denies any permanence. The root is Proto-Indo-European *men- ("to remain"), giving us Latin manēre → English "remain," "permanent," "mansion." In Modern Greek, μένω is one of the most common verbs, meaning both "to stay/live (somewhere)" and "to remain." Every Greek child learns μένω early — Heraclitus would appreciate the irony that the verb for "staying" has itself remained unchanged for millennia.',
        rag_scholia:
          'Holton et al., Greek: A Comprehensive Grammar (2012), §6.1.3: "μένω is a regular -ω verb of the first conjugation. The present stem μεν- takes the standard thematic endings. The aorist ἔμεινα shows an irregular stem alternation (ε→ει). This verb is among the most frequently occurring in all periods of Greek, from Homer to the present day."',
        has_paradigm: true,
        paradigm: [
          { form: 'μένω', tags: ['1st', 'singular', 'present', 'active'] },
          { form: 'μένεις', tags: ['2nd', 'singular', 'present', 'active'] },
          { form: 'μένει', tags: ['3rd', 'singular', 'present', 'active'] },
          { form: 'μένομεν', tags: ['1st', 'plural', 'present', 'active'] },
          { form: 'μένετε', tags: ['2nd', 'plural', 'present', 'active'] },
          { form: 'μένουσι', tags: ['3rd', 'plural', 'present', 'active'] },
          { form: 'ἔμενον', tags: ['1st', 'singular', 'imperfect', 'active'] },
          { form: 'ἔμενες', tags: ['2nd', 'singular', 'imperfect', 'active'] },
          { form: 'ἔμενε', tags: ['3rd', 'singular', 'imperfect', 'active'] },
          { form: 'ἔμεινα', tags: ['1st', 'singular', 'aorist', 'active'] },
          { form: 'ἔμεινας', tags: ['2nd', 'singular', 'aorist', 'active'] },
          { form: 'ἔμεινε', tags: ['3rd', 'singular', 'aorist', 'active'] },
        ],
      },
    ],
  },
  {
    id: 'cs-002',
    greek_text: 'ἓν οἶδα ὅτι οὐδὲν οἶδα.',
    translation: 'I know one thing: that I know nothing.',
    source: 'Socrates (via Plato, Apology 21d)',
    level: 'A2',
    knots: [
      {
        id: 'k-002-1',
        text: 'οἶδα',
        lemma: 'οἶδα',
        pos: 'VERB',
        tag: 'Mood=Ind|Number=Sing|Person=1|Tense=Perf|Voice=Act',
        transliteration: 'oîda',
        morphology: '1st Person Singular Perfect Active Indicative',
        definition: 'to know (by perception or reflection)',
        david_note:
          'οἶδα is one of the most remarkable verbs in Greek: a perfect tense with present meaning. It comes from the root *weid- ("to see"), so "I have seen" → "I know." This same root gives us Latin vidēre, English "wit," "wisdom," "video," and "idea" (ἰδέα, from the same root via εἶδος "form"). Socrates deploys it twice in this sentence — first asserting knowledge, then negating it — creating the paradox that genuine wisdom begins with recognizing one\'s own ignorance. In Modern Greek, the irregular verb ξέρω replaced οἶδα in speech, but the root survives in εἴδηση ("news," literally "knowing").',
        rag_scholia:
          'Holton et al., Greek: A Comprehensive Grammar (2012), §6.8.1: "οἶδα is a suppletive perfect-present verb — a perfect tense form functioning as a present. It has no present stem; the \'present\' meaning derives from the resultative aspect of the perfect (\'I have come to know\' → \'I know\'). This pattern is shared with Latin nōvī and Gothic wait. The pluperfect ᾔδη(ν) serves as the past tense."',
        has_paradigm: true,
        paradigm: [
          { form: 'οἶδα', tags: ['1st', 'singular', 'present', 'active'] },
          { form: 'οἶσθα', tags: ['2nd', 'singular', 'present', 'active'] },
          { form: 'οἶδε(ν)', tags: ['3rd', 'singular', 'present', 'active'] },
          { form: 'ἴσμεν', tags: ['1st', 'plural', 'present', 'active'] },
          { form: 'ἴστε', tags: ['2nd', 'plural', 'present', 'active'] },
          { form: 'ἴσασι(ν)', tags: ['3rd', 'plural', 'present', 'active'] },
        ],
      },
      {
        id: 'k-002-2',
        text: 'ἓν',
        lemma: 'εἷς',
        pos: 'ADJ',
        tag: 'Case=Acc|Gender=Neut|Number=Sing',
        transliteration: 'hèn',
        morphology: 'Accusative Neuter Singular',
        definition: 'one',
        david_note:
          'εἷς, μία, ἕν — "one" — is the cardinal numeral, from PIE *sem- ("one, together"), giving us English "same," "simple," "single." The neuter ἕν here is the direct object of οἶδα: "I know one thing." In Neoplatonic philosophy, τὸ ἕν ("The One") became the supreme metaphysical principle. In Modern Greek, ένας/μία/ένα continues directly from the ancient forms, also serving as the indefinite article — the concept of "one" becoming the concept of "a/an."',
        rag_scholia:
          'Holton et al., Greek: A Comprehensive Grammar (2012), §5.2.1: "The numeral εἷς, μία, ἕν (\'one\') is declined as follows: masculine εἷς/ἑνός/ἑνί/ἕνα, feminine μία/μιᾶς/μιᾷ/μίαν, neuter ἕν/ἑνός/ἑνί/ἕν. The rough breathing on masculine and neuter forms reflects the original digamma (*hens < *sems)."',
        has_paradigm: true,
        paradigm: [
          { form: 'εἷς', tags: ['nominative', 'singular', 'masculine'] },
          { form: 'μία', tags: ['nominative', 'singular', 'feminine'] },
          { form: 'ἕν', tags: ['nominative', 'singular', 'neuter'] },
          { form: 'ἑνός', tags: ['genitive', 'singular', 'masculine'] },
          { form: 'μιᾶς', tags: ['genitive', 'singular', 'feminine'] },
          { form: 'ἑνός', tags: ['genitive', 'singular', 'neuter'] },
          { form: 'ἕνα', tags: ['accusative', 'singular', 'masculine'] },
          { form: 'μίαν', tags: ['accusative', 'singular', 'feminine'] },
          { form: 'ἕν', tags: ['accusative', 'singular', 'neuter'] },
        ],
      },
    ],
  },
  {
    id: 'cs-003',
    greek_text: 'ἡ γὰρ φύσις ἅπαντα ποιεῖ.',
    translation: 'For nature makes all things.',
    source: 'Aristotle, Politics 1.1253a',
    level: 'A1',
    knots: [
      {
        id: 'k-003-1',
        text: 'φύσις',
        lemma: 'φύσις',
        pos: 'NOUN',
        tag: 'Case=Nom|Gender=Fem|Number=Sing',
        transliteration: 'phýsis',
        morphology: 'Nominative Feminine Singular',
        definition: 'nature, the natural order, innate quality',
        david_note:
          'φύσις is perhaps the single most important word in Greek philosophy. Derived from φύω ("to grow, to bring forth"), it means "the way things grow" — nature as process, not as static backdrop. This root gives us English "physics," "physical," "physiology," and "physician." The Pre-Socratics called their entire discipline περὶ φύσεως ("concerning nature"). In Modern Greek, φύση means simply "nature" — the philosophical grandeur has softened into the everyday, but the word endures unchanged across 2,500 years.',
        rag_scholia:
          'Holton et al., Greek: A Comprehensive Grammar (2012), §3.4.7: "Third-declension nouns in -σις (φύσις, πόλις, δύναμις) are feminine and follow the i-stem pattern. The nominative singular ends in -ις, genitive -εως (Attic) or -ιος (Koine). These nouns are extremely productive in forming abstract concepts from verbal roots: φύω → φύσις, πράττω → πρᾶξις, λύω → λύσις."',
        has_paradigm: true,
        paradigm: [
          { form: 'φύσις', tags: ['nominative', 'singular'] },
          { form: 'φύσεως', tags: ['genitive', 'singular'] },
          { form: 'φύσει', tags: ['dative', 'singular'] },
          { form: 'φύσιν', tags: ['accusative', 'singular'] },
          { form: 'φύσεις', tags: ['nominative', 'plural'] },
          { form: 'φύσεων', tags: ['genitive', 'plural'] },
          { form: 'φύσεσι(ν)', tags: ['dative', 'plural'] },
          { form: 'φύσεις', tags: ['accusative', 'plural'] },
        ],
      },
      {
        id: 'k-003-2',
        text: 'ποιεῖ',
        lemma: 'ποιέω',
        pos: 'VERB',
        tag: 'Mood=Ind|Number=Sing|Person=3|Tense=Pres|Voice=Act',
        transliteration: 'poieî',
        morphology: '3rd Person Singular Present Active Indicative',
        definition: 'to make, to do, to create, to compose',
        david_note:
          'ποιέω is the verb of creation — "to make, to do, to produce." From this verb comes ποιητής ("maker, poet"), ποίησις ("making, poetry"), and English "poet," "poem," and "poiesis." For the Greeks, the poet was literally "the maker" — the one who brings new things into being through language. Aristotle uses ποιεῖ here to attribute creative agency to nature itself: φύσις is the ultimate poet. In Modern Greek, the verb is κάνω for everyday "doing," but ποιητής ("poet") and ποίηση ("poetry") survive intact.',
        rag_scholia:
          'Holton et al., Greek: A Comprehensive Grammar (2012), §6.2.3: "Contract verbs in -εω are among the most common verb types. ποιέω contracts -εει to -εῖ in the 3rd singular present. The verb ποιέω is highly frequent across all registers and periods, with meanings ranging from concrete \'make/produce\' to abstract \'cause/bring about.\' The passive ποιεῖται often means \'to consider, to regard.\'"',
        has_paradigm: true,
        paradigm: [
          { form: 'ποιέω', tags: ['1st', 'singular', 'present', 'active'] },
          { form: 'ποιεῖς', tags: ['2nd', 'singular', 'present', 'active'] },
          { form: 'ποιεῖ', tags: ['3rd', 'singular', 'present', 'active'] },
          { form: 'ποιοῦμεν', tags: ['1st', 'plural', 'present', 'active'] },
          { form: 'ποιεῖτε', tags: ['2nd', 'plural', 'present', 'active'] },
          { form: 'ποιοῦσι(ν)', tags: ['3rd', 'plural', 'present', 'active'] },
          { form: 'ἐποίουν', tags: ['1st', 'singular', 'imperfect', 'active'] },
          { form: 'ἐποίεις', tags: ['2nd', 'singular', 'imperfect', 'active'] },
          { form: 'ἐποίει', tags: ['3rd', 'singular', 'imperfect', 'active'] },
          { form: 'ἐποίησα', tags: ['1st', 'singular', 'aorist', 'active'] },
          { form: 'ἐποίησας', tags: ['2nd', 'singular', 'aorist', 'active'] },
          { form: 'ἐποίησε(ν)', tags: ['3rd', 'singular', 'aorist', 'active'] },
        ],
      },
    ],
  },
];

// The complete island, wrapping sentences with metadata
export const MOCK_ISLAND: IslandDTO = {
  id: '1',
  title: 'The Elements of Fire',
  level: 'A2',
  progress: 45,
  sentences: MOCK_SENTENCES,
};

// Map of all available mock islands
export const MOCK_ISLANDS_MAP: Record<string, IslandDTO> = {
  '1': MOCK_ISLAND,
  '2': {
    id: '2',
    title: 'Justice and Law',
    level: 'A2',
    progress: 45,
    sentences: MOCK_SENTENCES, // Reuse for now — each island will have unique content when API is live
  },
  '3': {
    id: '3',
    title: 'The Whispering Woods',
    level: 'B1',
    progress: 10,
    sentences: MOCK_SENTENCES,
  },
  '4': {
    id: '4',
    title: 'Athenian Democracy',
    level: 'B2',
    progress: 85,
    sentences: MOCK_SENTENCES,
  },
};
