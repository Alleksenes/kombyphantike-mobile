/**
 * ROT13 cipher — symmetric, type-safe.
 * Encrypts and decrypts by rotating letters ±13 positions.
 * Non-alphabetic characters pass through unchanged.
 */
function rot13(input: string): string {
  return input.replace(/[a-zA-Z]/g, (char: string): string => {
    const base: number = char >= 'a' ? 97 : 65;
    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
  });
}

// ── Test ──────────────────────────────────────────────────────────────────────
const plaintext: string = 'Dil, varlığın evidir';
const encrypted: string = rot13(plaintext);
const decrypted: string = rot13(encrypted);

console.log(`Plain:   ${plaintext}`);
console.log(`Cipher:  ${encrypted}`);
console.log(`Decoded: ${decrypted}`);
console.log(`Roundtrip OK: ${plaintext === decrypted}`);
