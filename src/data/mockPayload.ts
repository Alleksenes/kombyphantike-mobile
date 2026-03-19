// ── MOCK PAYLOAD ──────────────────────────────────────────────────────────────
// Static mock data for visual development without hitting the live API.
// Uses the frontend-normalized types (Knot, CuratedSentenceDTO, IslandDTO).

import type { CuratedSentenceDTO, IslandDTO } from '../types';

// ── Sentence 1: "The governor wrote the book." ──────────────────────────────
const SENTENCE_1: CuratedSentenceDTO = {
  id: 'mock-sentence-1',
  greek_text: 'Ο κυβερνήτης έγραψε το βιβλίο με προσοχή.',
  translation: 'The governor wrote the book with care.',
  source: 'Modern Greek Primer, §14',
  level: 'B1',
  knots: [
    {
      id: 'knot-1',
      text: 'κυβερνήτης',
      lemma: 'κυβερνήτης',
      pos: 'NOUN',
      tag: 'Case=Nom|Gender=Masc|Number=Sing',
      transliteration: 'kyvernítis',
      morphology: 'Nominative singular masculine',
      definition: 'governor, pilot, helmsman',
      david_note:
        'From Ancient Greek κυβερνήτης (kybernḗtēs, "helmsman, pilot"), ' +
        'derived from κυβερνάω (kybernáō, "to steer, to govern"). The semantic ' +
        'shift from "one who steers a ship" to "one who governs a state" occurred ' +
        'in the Hellenistic period. Plato (Republic 488a-489c) uses the metaphor ' +
        'of the ship of state extensively. The Latin borrowing gubernātor preserves ' +
        'the original nautical sense, giving English "governor" via Old French. ' +
        'Modern Greek retains both senses: a ship\'s captain and a political leader.',
      rag_scholia:
        'κυβερνήτης (masc., -ες pl.): A second-declension masculine noun. ' +
        'In Modern Greek the term is used for both nautical captains and political ' +
        'governors (cf. Holton et al. §3.2.4). The form descends directly from ' +
        'the Ancient Greek without phonological alteration beyond the regular ' +
        'iotacism of η > /i/. Stress remains paroxytone throughout the paradigm. ' +
        'See also the derivative κυβέρνηση "government" and the verb κυβερνώ "to govern".',
      has_paradigm: true,
      paradigm: [
        { form: 'κυβερνήτης', tags: ['Nom', 'Sing'] },
        { form: 'κυβερνήτη', tags: ['Gen', 'Sing'] },
        { form: 'κυβερνήτη', tags: ['Acc', 'Sing'] },
        { form: 'κυβερνήτη', tags: ['Voc', 'Sing'] },
        { form: 'κυβερνήτες', tags: ['Nom', 'Plur'] },
        { form: 'κυβερνητών', tags: ['Gen', 'Plur'] },
        { form: 'κυβερνήτες', tags: ['Acc', 'Plur'] },
      ],
    },
    {
      id: 'knot-2',
      text: 'έγραψε',
      lemma: 'γράφω',
      pos: 'VERB',
      tag: 'Aspect=Perf|Mood=Ind|Number=Sing|Person=3|Tense=Past|VerbForm=Fin',
      transliteration: 'égrapse',
      morphology: '3rd person singular aorist indicative active',
      definition: 'he/she wrote',
      david_note:
        'From Ancient Greek ἔγραψε (égrapse), aorist of γράφω (gráphō, "to write, ' +
        'to scratch, to draw"). The original PIE root *gerbh- ("to scratch, carve") ' +
        'connects to English "carve" via Germanic. In Ancient Greek the word first ' +
        'meant "to scratch" (on wax tablets), then specialized to "writing." ' +
        'The augment ε- and the sigmatic aorist -ψ- are perfectly preserved in ' +
        'Modern Greek, making this one of the most transparent diachronic survivals ' +
        'in the verbal system. The modern simple past (αόριστος) continues the ' +
        'ancient aorist directly.',
      rag_scholia:
        'γράφω: Class I verb with sigmatic aorist stem γραψ-. The aorist paradigm ' +
        'is regular: έγραψα, έγραψες, έγραψε, γράψαμε, γράψατε, έγραψαν. Note ' +
        'the retention of the augment in singular forms and its loss in 1st/2nd ' +
        'plural (Holton et al. §5.6.2.1). The passive aorist is γράφτηκα. ' +
        'Perfective stem: γράψ-; imperfective stem: γράφ-.',
      has_paradigm: true,
      paradigm: [
        { form: 'έγραψα', tags: ['1Sg', 'Aor'] },
        { form: 'έγραψες', tags: ['2Sg', 'Aor'] },
        { form: 'έγραψε', tags: ['3Sg', 'Aor'] },
        { form: 'γράψαμε', tags: ['1Pl', 'Aor'] },
        { form: 'γράψατε', tags: ['2Pl', 'Aor'] },
        { form: 'έγραψαν', tags: ['3Pl', 'Aor'] },
      ],
    },
    {
      id: 'knot-3',
      text: 'βιβλίο',
      lemma: 'βιβλίο',
      pos: 'NOUN',
      tag: 'Case=Acc|Gender=Neut|Number=Sing',
      transliteration: 'vivlío',
      morphology: 'Accusative singular neuter',
      definition: 'book',
      david_note:
        'From Ancient Greek βιβλίον (biblíon), diminutive of βίβλος (bíblos, ' +
        '"papyrus, book"), itself from the Phoenician city Byblos (Βύβλος), ' +
        'the ancient center of the papyrus trade. The diminutive suffix -ίον ' +
        'dropped to -ίο in Modern Greek via regular neuter simplification. ' +
        'The word gave rise to English "Bible" (τὰ βιβλία, "the books") and the ' +
        'prefix biblio- (bibliography, bibliotheca). The ancient plural βιβλία ' +
        'was reanalyzed as a feminine singular in Medieval Greek, giving the ' +
        'modern Βίβλος/Αγία Γραφή for "the Bible," while βιβλίο remains the ' +
        'everyday word for a single book.',
      rag_scholia:
        'βιβλίο (neut., -α pl.): A regular neuter noun of the -ο declension. ' +
        'Declined: βιβλίο, βιβλίου, βιβλίο, βιβλίο (sg.); βιβλία, βιβλίων, ' +
        'βιβλία, βιβλία (pl.). The stress is proparoxytone in singular and shifts ' +
        'to paroxytone in genitive plural (Holton et al. §2.3.1). The voicing of ' +
        'β from /b/ to /v/ is a regular post-classical sound change.',
      has_paradigm: true,
      paradigm: [
        { form: 'βιβλίο', tags: ['Nom', 'Sing'] },
        { form: 'βιβλίου', tags: ['Gen', 'Sing'] },
        { form: 'βιβλίο', tags: ['Acc', 'Sing'] },
        { form: 'βιβλία', tags: ['Nom', 'Plur'] },
        { form: 'βιβλίων', tags: ['Gen', 'Plur'] },
        { form: 'βιβλία', tags: ['Acc', 'Plur'] },
      ],
    },
    {
      id: 'knot-4',
      text: 'προσοχή',
      lemma: 'προσοχή',
      pos: 'NOUN',
      tag: 'Case=Acc|Gender=Fem|Number=Sing',
      transliteration: 'prosochí',
      morphology: 'Accusative singular feminine',
      definition: 'care, attention, caution',
      david_note:
        'From Ancient Greek προσοχή (prosokhḗ, "attention, heedfulness"), a ' +
        'compound of πρός (prós, "towards") + ἔχω / ὀχή (ékhō / okhḗ, ' +
        '"holding, turning the mind towards"). The semantic core — "directing ' +
        'one\'s mental gaze" — has remained stable for over two millennia. ' +
        'In modern usage it appears frequently in the imperative warning ' +
        'Προσοχή! ("Caution!"), mirroring the ancient usage in philosophical ' +
        'and pedagogical contexts.',
      rag_scholia:
        'προσοχή (fem., -ές pl.): A feminine noun of the -ή declension. ' +
        'Regular paradigm: προσοχή, προσοχής, προσοχή, προσοχή (sg.); ' +
        'προσοχές, προσοχών, προσοχές, προσοχές (pl.). Oxytone stress ' +
        'throughout. (Holton et al. §2.2.3).',
      has_paradigm: false,
    },
  ],
};

// ── Sentence 2: "The sea brings news from afar." ────────────────────────────
const SENTENCE_2: CuratedSentenceDTO = {
  id: 'mock-sentence-2',
  greek_text: 'Η θάλασσα φέρνει νέα από μακριά.',
  translation: 'The sea brings news from afar.',
  source: 'Adapted from Seferis, Mythistorema',
  level: 'A2',
  knots: [
    {
      id: 'knot-5',
      text: 'θάλασσα',
      lemma: 'θάλασσα',
      pos: 'NOUN',
      tag: 'Case=Nom|Gender=Fem|Number=Sing',
      transliteration: 'thálassa',
      morphology: 'Nominative singular feminine',
      definition: 'sea',
      david_note:
        'From Ancient Greek θάλασσα (thálassa) or θάλαττα (thálatta) in ' +
        'Attic. A pre-Greek substrate word with no convincing Indo-European ' +
        'etymology — one of the clearest markers of the pre-Hellenic Mediterranean ' +
        'linguistic layer. The double sigma (σσ) vs. double tau (ττ) isogloss is ' +
        'the textbook example of Greek dialectology (Ionic-Attic split). Modern ' +
        'Greek universally uses the Ionic form θάλασσα.',
      rag_scholia:
        'θάλασσα (fem., -ες pl.): First-declension feminine noun. The ' +
        'geminate σσ is preserved from Ionic Greek and distinguishes the modern ' +
        'standard form from the ancient Attic θάλαττα. Declined regularly: ' +
        'θάλασσα, θάλασσας, θάλασσα (sg.); θάλασσες, θαλασσών, θάλασσες (pl.) ' +
        '(Holton et al. §2.2.1).',
      has_paradigm: false,
    },
    {
      id: 'knot-6',
      text: 'φέρνει',
      lemma: 'φέρνω',
      pos: 'VERB',
      tag: 'Aspect=Imp|Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin',
      transliteration: 'férni',
      morphology: '3rd person singular present indicative active',
      definition: 'brings, carries',
      david_note:
        'From Ancient Greek φέρω (phérō, "to carry, to bear"), one of the ' +
        'most ancient Indo-European verbs (cf. Latin ferō, English "bear," ' +
        'Sanskrit bhárati). The modern form φέρνω acquired an epenthetic -ν- ' +
        'in late medieval Greek, regularizing the stem. Despite this surface ' +
        'change, the semantic field has remained remarkably stable: physical ' +
        'carrying, metaphorical bringing, and enduring/tolerating.',
      rag_scholia:
        'φέρνω: A class I verb. Present: φέρνω, φέρνεις, φέρνει, φέρνουμε, ' +
        'φέρνετε, φέρνουν. Aorist stem: φερ- → έφερα (irregular sigmatic ' +
        'aorist lost; replaced by weak aorist). The epenthetic nasal is a ' +
        'hallmark of the modern verb system (Holton et al. §5.3.1).',
      has_paradigm: false,
    },
  ],
};

// ── The Mock Island ─────────────────────────────────────────────────────────
export const MOCK_ISLAND: IslandDTO = {
  id: 'mock-island-1',
  title: 'The Governor\'s Quill',
  level: 'B1',
  progress: 35,
  locked: false,
  sentences: [SENTENCE_1, SENTENCE_2],
};

export const MOCK_SENTENCES: CuratedSentenceDTO[] = [SENTENCE_1, SENTENCE_2];
