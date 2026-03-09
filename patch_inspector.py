import re

with open('components/ui/PhilologicalInspector.tsx', 'r') as f:
    content = f.read()

# Add ActivityIndicator to imports
if "ActivityIndicator" not in content:
    content = content.replace("StyleSheet, Text, TouchableOpacity, View } from 'react-native';", "StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';")

# Extract isLoading from usePhilologicalInspectorStore
if "const { knot, isOpen, activeTab, closeInspector, setActiveTab } = usePhilologicalInspectorStore();" in content:
    content = content.replace("const { knot, isOpen, activeTab, closeInspector, setActiveTab } = usePhilologicalInspectorStore();", "const { knot, isOpen, isLoading, activeTab, closeInspector, setActiveTab } = usePhilologicalInspectorStore();")

# Update renderKnotTab
old_render_knot = """
        {/* The Davidian Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteCardHeader}>
            <View style={styles.noteCardIcon}>
              <Text style={styles.noteCardIconText}>D</Text>
            </View>
            <Text style={styles.noteCardLabel}>Davidian Note</Text>
          </View>
          <Text style={styles.noteCardBody}>{knot.david_note}</Text>
        </View>
"""
new_render_knot = """
        {/* The Davidian Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteCardHeader}>
            <View style={styles.noteCardIcon}>
              <Text style={styles.noteCardIconText}>D</Text>
            </View>
            <Text style={styles.noteCardLabel}>Davidian Note</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color={GOLD} />
          ) : (
            <Text style={styles.noteCardBody}>
              {knot.david_note === 'Diachronic link undetermined.'
                ? 'The diachronic bridge is currently under construction.'
                : knot.david_note}
            </Text>
          )}
        </View>
"""
content = content.replace(old_render_knot, new_render_knot)

# Update renderScholiaTab
old_render_scholia = """
        {/* The RAG Scholia */}
        <View style={styles.scholiaCard}>
          <View style={styles.scholiaCardHeader}>
            <Text style={styles.scholiaSource}>Holton et al.</Text>
            <Text style={styles.scholiaSubtitle}>Greek: A Comprehensive Grammar</Text>
          </View>
          <View style={styles.scholiaDivider} />
          <Text style={styles.scholiaBody}>{knot.rag_scholia}</Text>
        </View>
"""
new_render_scholia = """
        {/* The RAG Scholia */}
        <View style={styles.scholiaCard}>
          <View style={styles.scholiaCardHeader}>
            <Text style={styles.scholiaSource}>Holton et al.</Text>
            <Text style={styles.scholiaSubtitle}>Greek: A Comprehensive Grammar</Text>
          </View>
          <View style={styles.scholiaDivider} />
          {isLoading ? (
            <ActivityIndicator size="small" color="#C0A062" />
          ) : (
            <Text style={styles.scholiaBody}>{knot.rag_scholia}</Text>
          )}
        </View>
"""
content = content.replace(old_render_scholia, new_render_scholia)


# Update renderParadigmTab
old_render_paradigm = """
        <View style={styles.sectionDivider} />

        {knot.has_paradigm && knot.paradigm ? (
          <ParadigmGrid
            paradigm={knot.paradigm}
            highlightForm={knot.text}
            pos={knot.pos}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No paradigm available for this form.</Text>
          </View>
        )}
"""
new_render_paradigm = """
        <View style={styles.sectionDivider} />

        {isLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="small" color={GOLD} />
          </View>
        ) : knot.has_paradigm && knot.paradigm ? (
          <ParadigmGrid
            paradigm={knot.paradigm}
            highlightForm={knot.text}
            pos={knot.pos}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No paradigm available for this form.</Text>
          </View>
        )}
"""
content = content.replace(old_render_paradigm, new_render_paradigm)


with open('components/ui/PhilologicalInspector.tsx', 'w') as f:
    f.write(content)
