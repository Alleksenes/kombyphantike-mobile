export const MockScroll = {
  instruction_text: "Translate the following sentences focusing on the nuances of Greek verbs and nouns.",
  worksheet_data: [
    {
      source_sentence: "I speak the truth.",
      target_sentence: "Λέγω την αλήθειαν.",
      ancient_context: "Plato, Apology",
      grammar_nuance: "Simple Present Active",
      knot_context: "The present tense indicates an action happening now.",
      target_tokens: [
        {
          text: "Λέγω",
          lemma: "λέγω",
          pos: "VERB",
          tag: "present-active-indicative-1-singular",
          morphology: "1st Person Singular, Present Active Indicative",
          definition: "To say, speak, or tell.",
          transliteration: "lego",
          ancient_context: "Often used in philosophical dialogues.",
          has_paradigm: true,
          paradigm: [
            // Present Active
            { form: "λέγω", tags: ["present", "active", "imperfective", "1", "singular"] },
            { form: "λέγεις", tags: ["present", "active", "imperfective", "2", "singular"] },
            { form: "λέγει", tags: ["present", "active", "imperfective", "3", "singular"] },
            { form: "λέγομεν", tags: ["present", "active", "imperfective", "1", "plural"] },
            { form: "λέγετε", tags: ["present", "active", "imperfective", "2", "plural"] },
            { form: "λέγουσι(ν)", tags: ["present", "active", "imperfective", "3", "plural"] },
            // Present Passive
            { form: "λέγομαι", tags: ["present", "passive", "imperfective", "1", "singular"] },
            { form: "λέγῃ", tags: ["present", "passive", "imperfective", "2", "singular"] },
            { form: "λέγεται", tags: ["present", "passive", "imperfective", "3", "singular"] },
            { form: "λεγόμεθα", tags: ["present", "passive", "imperfective", "1", "plural"] },
            { form: "λέγεσθε", tags: ["present", "passive", "imperfective", "2", "plural"] },
            { form: "λέγονται", tags: ["present", "passive", "imperfective", "3", "plural"] },
            // Imperfect Active
            { form: "ἔλεγον", tags: ["past", "active", "imperfective", "1", "singular"] },
            { form: "ἔλεγες", tags: ["past", "active", "imperfective", "2", "singular"] },
            { form: "ἔλεγε(ν)", tags: ["past", "active", "imperfective", "3", "singular"] },
            { form: "ἐλέγομεν", tags: ["past", "active", "imperfective", "1", "plural"] },
            { form: "ἐλέγετε", tags: ["past", "active", "imperfective", "2", "plural"] },
            { form: "ἔλεγον", tags: ["past", "active", "imperfective", "3", "plural"] },
            // Imperfect Passive
            { form: "ἐλεγόμην", tags: ["past", "passive", "imperfective", "1", "singular"] },
            { form: "ἐλέγου", tags: ["past", "passive", "imperfective", "2", "singular"] },
            { form: "ἐλέγετο", tags: ["past", "passive", "imperfective", "3", "singular"] },
            { form: "ἐλεγόμεθα", tags: ["past", "passive", "imperfective", "1", "plural"] },
            { form: "ἐλέγεσθε", tags: ["past", "passive", "imperfective", "2", "plural"] },
            { form: "ἐλέγοντο", tags: ["past", "passive", "imperfective", "3", "plural"] },
            // Future Active
            { form: "λέξω", tags: ["future", "active", "1", "singular"] },
            { form: "λέξεις", tags: ["future", "active", "2", "singular"] },
            { form: "λέξει", tags: ["future", "active", "3", "singular"] },
            { form: "λέξομεν", tags: ["future", "active", "1", "plural"] },
            { form: "λέξετε", tags: ["future", "active", "2", "plural"] },
            { form: "λέξουσι(ν)", tags: ["future", "active", "3", "plural"] },
            // Future Passive
            { form: "λεχθήσομαι", tags: ["future", "passive", "1", "singular"] },
            { form: "λεχθήσῃ", tags: ["future", "passive", "2", "singular"] },
            { form: "λεχθήσεται", tags: ["future", "passive", "3", "singular"] },
            { form: "λεχθησόμεθα", tags: ["future", "passive", "1", "plural"] },
            { form: "λεχθήσεσθε", tags: ["future", "passive", "2", "plural"] },
            { form: "λεχθήσονται", tags: ["future", "passive", "3", "plural"] },
            // Aorist Active
            { form: "ἔλεξα", tags: ["past", "active", "perfective", "1", "singular"] },
            { form: "ἔλεξας", tags: ["past", "active", "perfective", "2", "singular"] },
            { form: "ἔλεξε(ν)", tags: ["past", "active", "perfective", "3", "singular"] },
            { form: "ἐλέξαμεν", tags: ["past", "active", "perfective", "1", "plural"] },
            { form: "ἐλέξατε", tags: ["past", "active", "perfective", "2", "plural"] },
            { form: "ἔλεξαν", tags: ["past", "active", "perfective", "3", "plural"] },
            // Aorist Passive
            { form: "ἐλέχθην", tags: ["past", "passive", "perfective", "1", "singular"] },
            { form: "ἐλέχθης", tags: ["past", "passive", "perfective", "2", "singular"] },
            { form: "ἐλέχθη", tags: ["past", "passive", "perfective", "3", "singular"] },
            { form: "ἐλέχθημεν", tags: ["past", "passive", "perfective", "1", "plural"] },
            { form: "ἐλέχθητε", tags: ["past", "passive", "perfective", "2", "plural"] },
            { form: "ἐλέχθησαν", tags: ["past", "passive", "perfective", "3", "plural"] },
             // Subjunctive Active
            { form: "λέγω", tags: ["subjunctive", "active", "1", "singular"] },
            { form: "λέγῃς", tags: ["subjunctive", "active", "2", "singular"] },
            { form: "λέγῃ", tags: ["subjunctive", "active", "3", "singular"] },
            { form: "λέγωμεν", tags: ["subjunctive", "active", "1", "plural"] },
            { form: "λέγητε", tags: ["subjunctive", "active", "2", "plural"] },
            { form: "λέγωσι(ν)", tags: ["subjunctive", "active", "3", "plural"] },
             // Subjunctive Passive
            { form: "λέγωμαι", tags: ["subjunctive", "passive", "1", "singular"] },
            { form: "λέγῃ", tags: ["subjunctive", "passive", "2", "singular"] },
            { form: "λέγηται", tags: ["subjunctive", "passive", "3", "singular"] },
            { form: "λεγώμεθα", tags: ["subjunctive", "passive", "1", "plural"] },
            { form: "λέγησθε", tags: ["subjunctive", "passive", "2", "plural"] },
            { form: "λέγωνται", tags: ["subjunctive", "passive", "3", "plural"] },
          ]
        },
        {
          text: "την",
          lemma: "ο",
          pos: "DET",
          tag: "accusative-singular-feminine",
          morphology: "Accusative Singular Feminine",
          definition: "The",
          has_paradigm: false
        },
        {
          text: "αλήθειαν",
          lemma: "αλήθεια",
          pos: "NOUN",
          tag: "accusative-singular-feminine",
          morphology: "Accusative Singular Feminine",
          definition: "Truth, reality.",
          transliteration: "alitheian",
          ancient_context: "Central concept in Greek philosophy.",
          has_paradigm: true,
          paradigm: [
            { form: "αλήθεια", tags: ["nominative", "singular"] },
            { form: "αληθείας", tags: ["genitive", "singular"] },
            { form: "αληθείᾳ", tags: ["dative", "singular"] },
            { form: "αλήθειαν", tags: ["accusative", "singular"] },
            { form: "αλήθεια", tags: ["vocative", "singular"] },
            { form: "αλήθειαι", tags: ["nominative", "plural"] },
            { form: "αληθειών", tags: ["genitive", "plural"] },
            { form: "αληθείαις", tags: ["dative", "plural"] },
            { form: "αληθείας", tags: ["accusative", "plural"] },
            { form: "αλήθειαι", tags: ["vocative", "plural"] },
          ]
        },
         {
          text: ".",
          lemma: ".",
          pos: "PUNCT",
          has_paradigm: false
        }
      ]
    },
    {
      source_sentence: "The word was with God.",
      target_sentence: "Ο λόγος ήν προς τον Θεόν.",
      ancient_context: "John 1:1",
      grammar_nuance: "Nominative Subject",
      knot_context: "Logos signifies reason, word, or speech.",
      target_tokens: [
         {
          text: "Ο",
          lemma: "ο",
          pos: "DET",
          tag: "nominative-singular-masculine",
          morphology: "Nominative Singular Masculine",
          definition: "The",
          has_paradigm: false
        },
        {
          text: "λόγος",
          lemma: "λόγος",
          pos: "NOUN",
          tag: "nominative-singular-masculine",
          morphology: "Nominative Singular Masculine",
          definition: "Word, reason, speech.",
          transliteration: "logos",
          ancient_context: "Used by Heraclitus and the Stoics.",
          has_paradigm: true,
          paradigm: [
            { form: "λόγος", tags: ["nominative", "singular"] },
            { form: "λόγου", tags: ["genitive", "singular"] },
            { form: "λόγῳ", tags: ["dative", "singular"] },
            { form: "λόγον", tags: ["accusative", "singular"] },
            { form: "λόγε", tags: ["vocative", "singular"] },
            { form: "λόγοι", tags: ["nominative", "plural"] },
            { form: "λόγων", tags: ["genitive", "plural"] },
            { form: "λόγοις", tags: ["dative", "plural"] },
            { form: "λόγους", tags: ["accusative", "plural"] },
            { form: "λόγοι", tags: ["vocative", "plural"] },
          ]
        },
        {
          text: "ήν",
          lemma: "ειμί",
          pos: "VERB",
          tag: "imperfect-active-indicative-3-singular",
          morphology: "3rd Person Singular, Imperfect Active",
          definition: "Was (past of to be).",
          has_paradigm: false // Simplified for brevity
        },
        {
          text: "προς",
          lemma: "προς",
          pos: "ADP",
          definition: "With, towards.",
          has_paradigm: false
        },
         {
          text: "τον",
          lemma: "ο",
          pos: "DET",
          tag: "accusative-singular-masculine",
          morphology: "Accusative Singular Masculine",
          definition: "The",
          has_paradigm: false
        },
        {
          text: "Θεόν",
          lemma: "Θεός",
          pos: "NOUN",
          tag: "accusative-singular-masculine",
          morphology: "Accusative Singular Masculine",
          definition: "God",
          has_paradigm: true,
          paradigm: [
             { form: "Θεός", tags: ["nominative", "singular"] },
            { form: "Θεού", tags: ["genitive", "singular"] },
            { form: "Θεόν", tags: ["accusative", "singular"] },
            { form: "Θεέ", tags: ["vocative", "singular"] },
             { form: "Θεοί", tags: ["nominative", "plural"] },
            { form: "Θεών", tags: ["genitive", "plural"] },
            { form: "Θεούς", tags: ["accusative", "plural"] },
             { form: "Θεοί", tags: ["vocative", "plural"] },
          ]
        },
         {
          text: ".",
          lemma: ".",
          pos: "PUNCT",
          has_paradigm: false
        }
      ]
    }
  ]
};
