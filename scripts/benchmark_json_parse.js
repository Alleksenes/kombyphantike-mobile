const { performance } = require('perf_hooks');

// 1. Generate a large JSON object (simulating a complex curriculum)
const generateLargeData = () => {
  const items = [];
  for (let i = 0; i < 500; i++) {
    items.push({
      id: i,
      target_sentence: `This is sentence number ${i} in the curriculum.`,
      source_sentence: `Questa è la frase numero ${i} nel curriculum.`,
      ancient_context: `Contextus antiquus ${i} lorem ipsum dolor sit amet.`,
      target_tokens: Array.from({ length: 10 }, (_, j) => ({
        text: `token_${i}_${j}`,
        tag: `NOUN`,
        paradigm: Array.from({ length: 5 }, (_, k) => ({ form: `form_${k}`, tags: [`case_${k}`] }))
      })),
      grammar_nuance: `Nuance for sentence ${i}: careful with the dative case.`
    });
  }
  return items;
};

const data = generateLargeData();
const jsonString = JSON.stringify(data);
const sizeInMB = Buffer.byteLength(jsonString) / (1024 * 1024);

console.log(`Generated JSON blob size: ${sizeInMB.toFixed(2)} MB`);

// 2. Benchmark JSON.parse
const iterations = 100;
let totalTime = 0;

for (let i = 0; i < iterations; i++) {
  const start = performance.now();
  JSON.parse(jsonString);
  const end = performance.now();
  totalTime += (end - start);
}

const avgTime = totalTime / iterations;

console.log(`Average JSON.parse time over ${iterations} iterations: ${avgTime.toFixed(2)} ms`);
console.log(`This simulates the UI thread blocking time if parsing happens on button press.`);
