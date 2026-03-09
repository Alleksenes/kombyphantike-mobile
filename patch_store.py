import re

with open('src/store/philologicalInspectorStore.ts', 'r') as f:
    content = f.read()

# Import ApiService
if "ApiService" not in content:
    content = content.replace("import { Knot } from '../types';", "import { Knot } from '../types';\nimport { ApiService } from '../services/ApiService';")

# Add isLoading
if "isLoading: boolean;" not in content:
    content = content.replace("isOpen: boolean;", "isOpen: boolean;\n  isLoading: boolean;")

# Update create
if "isLoading: false," not in content:
    content = content.replace("isOpen: false,", "isOpen: false,\n  isLoading: false,")

# Update openInspector logic
old_open = "openInspector: (knot, tab = 'knot') => set({ knot, isOpen: true, activeTab: tab }),"
new_open = """openInspector: async (knot, tab = 'knot') => {
    set({ knot, isOpen: true, activeTab: tab, isLoading: true });
    try {
      if (knot.lemma) {
        const data = await ApiService.inspectLemma(knot.lemma);
        set((state) => {
          if (state.knot && state.knot.id === knot.id) {
            return {
              knot: {
                ...state.knot,
                david_note: data.david_note,
                rag_scholia: data.rag_scholia,
                paradigm: data.paradigm,
                has_paradigm: Array.isArray(data.paradigm) && data.paradigm.length > 0,
              },
              isLoading: false,
            };
          }
          return { isLoading: false };
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Failed to inspect lemma:', e);
      set({ isLoading: false });
    }
  },"""
content = content.replace(old_open, new_open)

with open('src/store/philologicalInspectorStore.ts', 'w') as f:
    f.write(content)
