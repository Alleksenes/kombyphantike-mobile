import re

with open('src/services/ApiService.ts', 'r') as f:
    content = f.read()

types_to_add = """
export interface InspectLemmaResponse {
  david_note: string;
  rag_scholia: string;
  paradigm: any[];
}
"""

if "export interface InspectLemmaResponse" not in content:
    content = content.replace("export interface SpeakResponse {", types_to_add + "\nexport interface SpeakResponse {")

methods_to_add = """
  synthesizeIsland: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/islands/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errorText}`);
    }
    return response.json();
  },

  inspectLemma: async (lemma: string): Promise<InspectLemmaResponse> => {
    const response = await fetch(`${API_BASE_URL}/inspect/${lemma}`, {
      method: 'GET',
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errorText}`);
    }
    return response.json();
  },
"""

if "synthesizeIsland:" not in content:
    content = content.replace("speak: async", methods_to_add + "\n  speak: async")

with open('src/services/ApiService.ts', 'w') as f:
    f.write(content)
