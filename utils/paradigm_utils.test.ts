import { normalize, matchTags } from './paradigm_utils';

describe('normalize', () => {
  test('normalizes person tags', () => {
    expect(normalize('1st')).toBe('1');
    expect(normalize('first-person')).toBe('1');
    expect(normalize('2nd')).toBe('2');
    expect(normalize('second-person')).toBe('2');
    expect(normalize('3rd')).toBe('3');
    expect(normalize('third-person')).toBe('3');
  });

  test('normalizes number tags', () => {
    expect(normalize('sg')).toBe('singular');
    expect(normalize('singular')).toBe('singular');
    expect(normalize('pl')).toBe('plural');
    expect(normalize('plural')).toBe('plural');
  });

  test('normalizes mood tags', () => {
    expect(normalize('ind')).toBe('indicative');
    expect(normalize('indicative')).toBe('indicative');
    expect(normalize('sub')).toBe('subjunctive');
    expect(normalize('subj')).toBe('subjunctive');
    expect(normalize('imp')).toBe('imperative');
    expect(normalize('inf')).toBe('infinitive');
    expect(normalize('part')).toBe('participle');
  });

  test('normalizes voice tags', () => {
    expect(normalize('act')).toBe('active');
    expect(normalize('active')).toBe('active');
    expect(normalize('pass')).toBe('passive');
    expect(normalize('passive')).toBe('passive');
    expect(normalize('mid')).toBe('middle');
  });

  test('normalizes tense and aspect tags', () => {
    expect(normalize('pres')).toBe('present');
    expect(normalize('present')).toBe('present');
    expect(normalize('fut')).toBe('future');
    expect(normalize('aor')).toBe('aorist');
    expect(normalize('aorist')).toBe('aorist');
    expect(normalize('past')).toBe('past');
    expect(normalize('perf')).toBe('perfect'); // Note: first match in code
    expect(normalize('perfect')).toBe('perfect');
    expect(normalize('impf')).toBe('imperfect'); // Note: first match in code
    expect(normalize('imperfect')).toBe('imperfect');
    expect(normalize('perfective')).toBe('perfective');
    expect(normalize('imperfective')).toBe('imperfective');
  });

  test('normalizes case tags', () => {
    expect(normalize('nom')).toBe('nominative');
    expect(normalize('gen')).toBe('genitive');
    expect(normalize('acc')).toBe('accusative');
    expect(normalize('voc')).toBe('vocative');
  });

  test('normalizes gender tags', () => {
    expect(normalize('masc')).toBe('masculine');
    expect(normalize('fem')).toBe('feminine');
    expect(normalize('neut')).toBe('neuter');
  });

  test('handles case and whitespace', () => {
    expect(normalize('  Singular  ')).toBe('singular');
    expect(normalize('1ST')).toBe('1');
  });

  test('returns original string if no match found', () => {
    expect(normalize('unknown-tag')).toBe('unknown-tag');
  });

  test('handles null/undefined', () => {
    expect(normalize(null as any)).toBe('');
    expect(normalize(undefined as any)).toBe('');
  });
});

describe('matchTags', () => {
  test('returns true if no required tags', () => {
    expect(matchTags(['1', 'singular'], [])).toBe(true);
    expect(matchTags(['1', 'singular'], null as any)).toBe(true);
  });

  test('returns false if form has no tags but tags are required', () => {
    expect(matchTags([], ['1'])).toBe(false);
    expect(matchTags(null as any, ['1'])).toBe(false);
  });

  test('matches exact tags', () => {
    expect(matchTags(['1', 'singular', 'present'], ['1', 'singular', 'present'])).toBe(true);
  });

  test('matches with normalization', () => {
    expect(matchTags(['1st', 'sg', 'pres'], ['1', 'singular', 'present'])).toBe(true);
  });

  test('matches when form has extra tags', () => {
    expect(matchTags(['1', 'singular', 'present', 'active', 'indicative'], ['1', 'singular', 'present'])).toBe(true);
  });

  test('fails if too many required tags are missing', () => {
    // 3 required tags. 1 match (1st). 2 misses (plural, future).
    // Threshold is 2. Hits 1 < 2. Should fail.
    expect(matchTags(['1', 'singular', 'present'], ['1', 'plural', 'future'])).toBe(false);
  });

  test('exclusion logic: aorist cannot match imperfective', () => {
    // If we require "aorist", and form has "imperfective", it should fail
    expect(matchTags(['aorist', 'imperfective'], ['aorist'])).toBe(false);
    expect(matchTags(['aorist', 'perfective'], ['aorist'])).toBe(true);
  });

  test('exclusion logic: imperfect cannot match perfective', () => {
    // If we require "imperfect", and form has "perfective", it should fail
    expect(matchTags(['imperfect', 'perfective'], ['imperfect'])).toBe(false);
    expect(matchTags(['imperfect', 'imperfective'], ['imperfect'])).toBe(true);
  });

  test('allows 1 miss for long queries (>=3 tags)', () => {
    // 3 required tags. 2 match. 1 miss. Should pass.
    expect(matchTags(['1', 'present'], ['1', 'singular', 'present'])).toBe(true);
  });

  test('handles short queries strictly (<3 tags)', () => {
    // 2 required tags. 1 match. 1 miss. Should fail (0 misses allowed).
    expect(matchTags(['1'], ['1', 'singular'])).toBe(false);
  });
});
