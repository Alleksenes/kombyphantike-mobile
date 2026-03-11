import { CuratedSentenceDTO, Knot } from '../types';

export const mockKnots: Knot[] = [
  {
    id: 'mock-knot-1',
    text: 'κόσμον',
    lemma: 'κόσμος',
    pos: 'NOUN',
    david_note: "The diachronic evolution of 'κόσμος' spans from an early sense of 'order' or 'ornament' in Homeric Greek, developing into the concept of the 'world' or 'universe' in philosophical contexts. It retains this broader cosmological meaning into the Hellenistic and modern periods.",
    rag_scholia: "Holton et al., Greek: A Comprehensive Grammar, notes the enduring significance of cosmology terminology in shaping abstract noun paradigms.",
  },
  {
    id: 'mock-knot-2',
    text: 'λόγος',
    lemma: 'λόγος',
    pos: 'NOUN',
    david_note: "A term of profound significance, 'λόγος' encompasses 'word', 'account', 'reason', and 'speech'. From its root in 'λέγω' (to gather, count, say), it evolved through Heraclitean philosophy to represent the universal principle of order, continuing to influence theological and philosophical discourse diachronically.",
    rag_scholia: "The semantic breadth of 'λόγος' exemplifies the layered complexity of Greek nominal inflection as detailed by Holton et al.",
  }
];

export const mockCuratedSentence: CuratedSentenceDTO = {
  id: 'mock-sentence-1',
  greek_text: 'τον κόσμον και τον λόγος κατανοώ',
  translation: 'I understand the world and the reason.',
  knots: mockKnots,
  source: 'Mock data for Component Laboratory',
  level: 'B2',
};
