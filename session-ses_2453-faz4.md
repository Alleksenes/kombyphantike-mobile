# Faz 4: Hooks analizi ve re-render sızıntıları

**Session ID:** ses_2453b10d8ffeVYmTZxgM63qWkr
**Created:** 4/23/2026, 5:36:01 PM
**Updated:** 4/23/2026, 5:52:43 PM

---

## User

Baş Filolog, Frontend otopsisinde Faz 4: Sinir Ağları (Hooks) analizini yapıyoruz.
Görevin: Sadece src/hooks/useIslandData.ts dosyasını ve hooks/ klasöründeki tema hook'larını oku.
Bu hook'ların store ve komponentler arasında nasıl bir köprü kurduğunu, re-render sızıntıları olup olmadığını (Pathology) analiz et ve çözüm (Restoration) üret.
Sonucu [Faz 4] - Sinir Ağları (Hooks) Otopsisi başlığıyla Lemma'ya (memory_add) kaydet. 

---

## Assistant (Build · Qwen3.6-27B-4bit · 40.1s)

_Thinking:_


The user wants me to analyze hooks in the src/hooks/ directory, specifically useIslandData.ts and theme-related hooks, looking for re-render leaks and bridge patterns between stores and components. Let me read the relevant files.






**Tool: glob**

**Input:**
```json
{
  "pattern": "src/hooks/**/*.ts*"
}
```

**Output:**
```
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/hooks/useIslandData.ts
```

---

## Assistant (Build · Qwen3.6-27B-4bit · 14.2s)

_Thinking:_


The user mentioned "hooks/ klasöründeki tema hook'larını" but glob only found useIslandData.ts. Let me also search for theme-related hooks that might be in other locations, like src/hooks/ or directly in src/. The user said "hooks/ klasöründeki tema hook'larını" - let me check if there's a separate hooks directory or if theme hooks are elsewhere.

Let me also search for any useTheme or similar hooks.







**Tool: grep**

**Input:**
```json
{
  "pattern": "useTheme|useIslandData",
  "include": "*.ts*"
}
```

**Output:**
```
Found 21 matches
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/hooks/useIslandData.ts:
  Line 1: // ── useIslandData ─────────────────────────────────────────────────────────────

  Line 14: export function useIslandData(islandId: string): UseIslandDataResult {


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-theme-color.ts:
  Line 9: export function useThemeColor(


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-theme-color.test.tsx:
  Line 3: import { useThemeColor } from './use-theme-color';

  Line 21:   const result = useThemeColor(hookProps, colorName);

  Line 26: describe('useThemeColor', () => {


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-theme-color.test.ts:
  Line 1: import { useThemeColor } from './use-theme-color';

  Line 9: describe('useThemeColor', () => {

  Line 16:     const color = useThemeColor({}, 'text');

  Line 22:     const color = useThemeColor({}, 'text');

  Line 28:     const color = useThemeColor({ light: '#123456' }, 'text');

  Line 34:     const color = useThemeColor({ dark: '#654321' }, 'text');

  Line 40:     const color = useThemeColor({}, 'text');


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/components/themed-text.tsx:
  Line 3: import { useThemeColor } from '@/hooks/use-theme-color';

  Line 18:   const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/components/parallax-scroll-view.tsx:
  Line 12: import { useThemeColor } from '@/hooks/use-theme-color';

  Line 26:   const backgroundColor = useThemeColor({}, 'background');


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/components/themed-view.tsx:
  Line 3: import { useThemeColor } from '@/hooks/use-theme-color';

  Line 11:   const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/island/[id].tsx:
  Line 26: import { useIslandData } from '../../src/hooks/useIslandData';

  Line 218:   const { island: apiIsland, loading, error } = useIslandData(islandId);

```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/hooks/useIslandData.ts"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/hooks/useIslandData.ts</path>
<type>file</type>
<content>
1: // ── useIslandData ─────────────────────────────────────────────────────────────
2: // Returns island data from the API via ApiService (auth-aware).
3: import { useCallback, useEffect, useState } from 'react';
4: import { IslandDTO, ApiError } from '../types';
5: import { ApiService } from '../services/ApiService';
6: 
7: interface UseIslandDataResult {
8:   island: IslandDTO | null;
9:   loading: boolean;
10:   error: string | null;
11:   refetch: () => void;
12: }
13: 
14: export function useIslandData(islandId: string): UseIslandDataResult {
15:   const [island, setIsland] = useState<IslandDTO | null>(null);
16:   const [loading, setLoading] = useState(true);
17:   const [error, setError] = useState<string | null>(null);
18: 
19:   const fetchIsland = useCallback(async () => {
20:     setLoading(true);
21:     setError(null);
22: 
23:     try {
24:       const data = await ApiService.getIsland(islandId);
25:       setIsland(data);
26:     } catch (e: any) {
27:       if (e instanceof ApiError) {
28:         setError(e.kind === 'unauthorized' ? 'Please sign in to access this island.' : e.message);
29:       } else {
30:         setError(e.message || 'Failed to fetch island data.');
31:       }
32:     } finally {
33:       setLoading(false);
34:     }
35:   }, [islandId]);
36: 
37:   useEffect(() => {
38:     fetchIsland();
39:   }, [fetchIsland]);
40: 
41:   return { island, loading, error, refetch: fetchIsland };
42: }

(End of file - total 42 lines)
</content>
```

---

## Assistant (Build · Qwen3.6-27B-4bit · 16.8s)

_Thinking:_


Now let me read the hooks/ directory (not src/hooks/) for theme hooks, and also read the relevant store files and the component that uses useIslandData.








**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-theme-color.ts"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-theme-color.ts</path>
<type>file</type>
<content>
1: /**
2:  * Learn more about light and dark modes:
3:  * https://docs.expo.dev/guides/color-schemes/
4:  */
5: 
6: import { Colors } from '@/src/theme';
7: import { useColorScheme } from '@/hooks/use-color-scheme';
8: 
9: export function useThemeColor(
10:   props: { light?: string; dark?: string },
11:   colorName: keyof typeof Colors.light & keyof typeof Colors.dark
12: ) {
13:   const theme = useColorScheme() ?? 'light';
14:   const colorFromProps = props[theme];
15: 
16:   if (colorFromProps) {
17:     return colorFromProps;
18:   } else {
19:     return Colors[theme][colorName];
20:   }
21: }

(End of file - total 21 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks</path>
<type>directory</type>
<entries>
use-color-scheme.ts
use-color-scheme.web.ts
use-theme-color.test.ts
use-theme-color.test.tsx
use-theme-color.ts

(5 entries)
</entries>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/island/[id].tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/island/[id].tsx</path>
<type>file</type>
<content>
1: // ── THE ISLAND READER ────────────────────────────────────────────────────────
2: // A distraction-free, glassmorphic reading pane for CuratedSentenceDTOs.
3: // Tappable knot-words glow Byzantine Gold and open the Philological Inspector.
4: 
5: import React, { useCallback, useMemo } from 'react';
6: import {
7:   ActivityIndicator,
8:   Dimensions,
9:   FlatList,
10:   Pressable,
11:   StyleSheet,
12:   Text,
13:   View,
14: } from 'react-native';
15: import { useLocalSearchParams, useRouter } from 'expo-router';
16: import { SafeAreaView } from 'react-native-safe-area-context';
17: import { IconButton } from 'react-native-paper';
18: import Animated, {
19:   useAnimatedStyle,
20:   useSharedValue,
21:   withRepeat,
22:   withSequence,
23:   withTiming,
24:   Easing,
25: } from 'react-native-reanimated';
26: import { useIslandData } from '../../src/hooks/useIslandData';
27: import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
28: import { AudioPlayer } from '../../src/services/AudioPlayer';
29: import { MOCK_ISLAND } from '../../src/data/mockPayload';
30: import type { CuratedSentenceDTO, Knot } from '../../src/types';
31: 
32: const { width: SCREEN_WIDTH } = Dimensions.get('window');
33: const CARD_WIDTH = SCREEN_WIDTH * 0.92;
34: 
35: // ── Design Tokens ────────────────────────────────────────────────────────────
36: const GOLD = '#C5A059';
37: const GOLD_DIM = 'rgba(197, 160, 89, 0.2)';
38: const GOLD_GLOW = 'rgba(197, 160, 89, 0.35)';
39: const PARCHMENT = '#E3DCCB';
40: const GRAY_TEXT = '#9CA3AF';
41: 
42: // ── Animated Knot Word ──────────────────────────────────────────────────────
43: // A tappable word with a subtle Byzantine Gold underline glow when it's a knot.
44: function KnotWord({
45:   knot,
46:   isActive,
47:   onPress,
48: }: {
49:   knot: Knot;
50:   isActive: boolean;
51:   onPress: (k: Knot) => void;
52: }) {
53:   // Subtle pulsing glow for knot words at rest
54:   const glowOpacity = useSharedValue(0.4);
55: 
56:   React.useEffect(() => {
57:     glowOpacity.value = withRepeat(
58:       withSequence(
59:         withTiming(0.8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
60:         withTiming(0.4, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
61:       ),
62:       -1, // infinite
63:       false,
64:     );
65:   }, [glowOpacity]);
66: 
67:   const underlineStyle = useAnimatedStyle(() => ({
68:     opacity: isActive ? 1 : glowOpacity.value,
69:     backgroundColor: isActive ? GOLD : GOLD_GLOW,
70:   }));
71: 
72:   return (
73:     <Pressable
74:       onPress={() => onPress(knot)}
75:       style={[styles.knotChip, isActive && styles.knotChipActive]}
76:     >
77:       <Text
78:         style={[
79:           styles.knotText,
80:           isActive ? styles.knotTextActive : styles.knotTextNormal,
81:         ]}
82:       >
83:         {knot.text}
84:       </Text>
85:       {/* The Byzantine Gold underline */}
86:       <Animated.View style={[styles.knotUnderline, underlineStyle]} />
87:       {knot.transliteration && (
88:         <Text
89:           style={[
90:             styles.knotTranslit,
91:             isActive ? styles.knotTranslitActive : styles.knotTranslitNormal,
92:           ]}
93:         >
94:           {knot.transliteration}
95:         </Text>
96:       )}
97:     </Pressable>
98:   );
99: }
100: 
101: // ── Sentence Card ───────────────────────────────────────────────────────────
102: // A glassmorphic container. Parses greek_text and cross-references with knots.
103: function SentenceCard({
104:   sentence,
105:   activeKnotId,
106:   onKnotPress,
107: }: {
108:   sentence: CuratedSentenceDTO;
109:   activeKnotId: string | null;
110:   onKnotPress: (knot: Knot) => void;
111: }) {
112:   // Build a lookup: stripped word → Knot
113:   const knotMap = useMemo(() => {
114:     const map = new Map<string, Knot>();
115:     sentence.knots.forEach((k) => map.set(k.text, k));
116:     return map;
117:   }, [sentence.knots]);
118: 
119:   // Parse the sentence into tokens, matching words to knots
120:   const tokens = useMemo(() => {
121:     const words = sentence.greek_text.split(/\s+/);
122:     return words.map((word, idx) => {
123:       // Strip trailing punctuation for matching
124:       const stripped = word.replace(/[.,;·;:!?()«»]+$/, '');
125:       const knot = knotMap.get(stripped) || knotMap.get(word);
126:       const trailingPunct = word.slice(stripped.length);
127:       return { word, stripped, knot, trailingPunct, idx };
128:     });
129:   }, [sentence.greek_text, knotMap]);
130: 
131:   // Find the first knot with grammar_scholia for the teaser
132:   const grammarTeaser = useMemo(() => {
133:     for (const k of sentence.knots) {
134:       if (k.grammar_scholia) return k.grammar_scholia;
135:     }
136:     return null;
137:   }, [sentence.knots]);
138: 
139:   return (
140:     <View style={styles.sentenceCard}>
141:       {/* Header */}
142:       <View style={styles.cardHeader}>
143:         <Text style={styles.cardHeaderLabel}>Active Node</Text>
144:         <View style={styles.cardHeaderRight}>
145:           {/* Pneuma: Audio Play Icon */}
146:           <Pressable
147:             onPress={() => AudioPlayer.playSentence(sentence.greek_text)}
148:             style={styles.pneumaButton}
149:           >
150:             <Text style={styles.pneumaIcon}>♫</Text>
151:             <Text style={styles.pneumaLabel}>Pneuma</Text>
152:           </Pressable>
153:           {sentence.source && (
154:             <Text style={styles.cardSource} numberOfLines={1}>
155:               {sentence.source}
156:             </Text>
157:           )}
158:         </View>
159:       </View>
160: 
161:       {/* The Interactive Text */}
162:       <View style={styles.knotRow}>
163:         {tokens.map(({ word, knot, trailingPunct, idx }) => {
164:           if (knot) {
165:             return (
166:               <View key={`${word}-${idx}`} style={styles.knotWrapper}>
167:                 <KnotWord
168:                   knot={knot}
169:                   isActive={activeKnotId === knot.id}
170:                   onPress={onKnotPress}
171:                 />
172:                 {trailingPunct ? (
173:                   <Text style={styles.punctuation}>{trailingPunct}</Text>
174:                 ) : null}
175:               </View>
176:             );
177:           }
178:           // Non-knot word — plain, dimmed text
179:           return (
180:             <Text key={`${word}-${idx}`} style={styles.plainWord}>
181:               {word}
182:             </Text>
183:           );
184:         })}
185:       </View>
186: 
187:       {/* Translation */}
188:       <View style={styles.translationContainer}>
189:         <Text style={styles.translationText}>{sentence.translation}</Text>
190:       </View>
191: 
192:       {/* Rationale: Grammar Scholia Teaser */}
193:       {grammarTeaser && (
194:         <View style={styles.rationaleContainer}>
195:           <Text style={styles.rationaleLabel}>Rationale</Text>
196:           <Text style={styles.rationaleText} numberOfLines={2}>
197:             {grammarTeaser}
198:           </Text>
199:         </View>
200:       )}
201: 
202:       {/* Level badge */}
203:       {sentence.level && (
204:         <View style={styles.levelBadge}>
205:           <Text style={styles.levelBadgeText}>{sentence.level}</Text>
206:         </View>
207:       )}
208:     </View>
209:   );
210: }
211: 
212: // ── Main Screen ──────────────────────────────────────────────────────────────
213: export default function IslandWorkbench() {
214:   const { id } = useLocalSearchParams();
215:   const router = useRouter();
216:   const islandId = typeof id === 'string' ? id : '1';
217: 
218:   const { island: apiIsland, loading, error } = useIslandData(islandId);
219:   const { knot: activeKnot, openInspector } = useInspectorStore();
220: 
221:   // Fall back to mock data when the API is unavailable
222:   const island = apiIsland ?? (loading ? null : MOCK_ISLAND);
223:   const isMock = !apiIsland && !loading;
224: 
225:   const handleKnotPress = useCallback(
226:     (knot: Knot) => {
227:       openInspector(knot, 'knot');
228:     },
229:     [openInspector],
230:   );
231: 
232:   const renderSentence = useCallback(
233:     ({ item }: { item: CuratedSentenceDTO }) => (
234:       <View style={styles.cardContainer}>
235:         <SentenceCard
236:           sentence={item}
237:           activeKnotId={activeKnot?.id ?? null}
238:           onKnotPress={handleKnotPress}
239:         />
240:       </View>
241:     ),
242:     [activeKnot, handleKnotPress],
243:   );
244: 
245:   // Loading state
246:   if (loading && !island) {
247:     return (
248:       <SafeAreaView style={styles.safeArea}>
249:         <View style={styles.loadingContainer}>
250:           <ActivityIndicator size="large" color={GOLD} />
251:           <Text style={styles.loadingText}>Assembling the island...</Text>
252:         </View>
253:       </SafeAreaView>
254:     );
255:   }
256: 
257:   // Error state (with no fallback)
258:   if (!island) {
259:     return (
260:       <SafeAreaView style={styles.safeArea}>
261:         <View style={styles.loadingContainer}>
262:           <Text style={styles.errorText}>
263:             {error || 'Island not found.'}
264:           </Text>
265:           <IconButton
266:             icon="chevron-left"
267:             iconColor={GOLD}
268:             size={32}
269:             onPress={() => router.back()}
270:           />
271:         </View>
272:       </SafeAreaView>
273:     );
274:   }
275: 
276:   const progress = `${island.progress}%` as const;
277: 
278:   return (
279:     <SafeAreaView style={styles.safeArea}>
280:       {/* ── Header ─────────────────────────────────────────────────────────── */}
281:       <View style={styles.header}>
282:         <IconButton
283:           icon="chevron-left"
284:           iconColor={GOLD}
285:           size={32}
286:           onPress={() => router.back()}
287:           style={styles.backButton}
288:         />
289:         <View style={styles.headerContent}>
290:           <Text style={styles.title} numberOfLines={1}>
291:             {island.title}
292:           </Text>
293:           <View style={styles.headerMeta}>
294:             <Text style={styles.levelText}>{island.level}</Text>
295:             {isMock && <Text style={styles.mockBadge}>MOCK</Text>}
296:           </View>
297:           <View style={styles.progressContainer}>
298:             <View style={[styles.progressFill, { width: progress }]} />
299:           </View>
300:         </View>
301:       </View>
302: 
303:       {/* ── Sentence List ──────────────────────────────────────────────────── */}
304:       <FlatList
305:         data={island.sentences}
306:         renderItem={renderSentence}
307:         keyExtractor={(item) => item.id}
308:         contentContainerStyle={styles.listContent}
309:         showsVerticalScrollIndicator={false}
310:       />
311:     </SafeAreaView>
312:   );
313: }
314: 
315: // ── Styles ────────────────────────────────────────────────────────────────────
316: const styles = StyleSheet.create({
317:   safeArea: {
318:     flex: 1,
319:     backgroundColor: 'transparent',
320:   },
321: 
322:   // ── Loading / Error ─────────────────────────────────────────────────────
323:   loadingContainer: {
324:     flex: 1,
325:     justifyContent: 'center',
326:     alignItems: 'center',
327:     gap: 16,
328:   },
329:   loadingText: {
330:     fontFamily: 'GFSDidot',
331:     fontSize: 16,
332:     color: 'rgba(197, 160, 89, 0.6)',
333:     fontStyle: 'italic',
334:   },
335:   errorText: {
336:     fontFamily: 'NeueHaasGrotesk-Text',
337:     fontSize: 14,
338:     color: '#EF4444',
339:     textAlign: 'center',
340:     paddingHorizontal: 40,
341:   },
342: 
343:   // ── Header ──────────────────────────────────────────────────────────────
344:   header: {
345:     flexDirection: 'row',
346:     alignItems: 'center',
347:     paddingHorizontal: 8,
348:     paddingVertical: 16,
349:     borderBottomWidth: 1,
350:     borderBottomColor: GOLD_DIM,
351:   },
352:   backButton: {
353:     margin: 0,
354:   },
355:   headerContent: {
356:     flex: 1,
357:     marginLeft: 8,
358:     marginRight: 24,
359:   },
360:   title: {
361:     fontFamily: 'GFSDidot',
362:     fontSize: 24,
363:     color: PARCHMENT,
364:     marginBottom: 4,
365:   },
366:   headerMeta: {
367:     flexDirection: 'row',
368:     alignItems: 'center',
369:     gap: 8,
370:     marginBottom: 8,
371:   },
372:   levelText: {
373:     fontFamily: 'NeueHaasGrotesk-Display',
374:     fontSize: 10,
375:     fontWeight: 'bold',
376:     color: GOLD,
377:     textTransform: 'uppercase',
378:     letterSpacing: 1,
379:   },
380:   mockBadge: {
381:     fontFamily: 'NeueHaasGrotesk-Display',
382:     fontSize: 8,
383:     fontWeight: 'bold',
384:     color: '#EF4444',
385:     backgroundColor: 'rgba(239, 68, 68, 0.15)',
386:     paddingHorizontal: 6,
387:     paddingVertical: 2,
388:     borderRadius: 4,
389:     overflow: 'hidden',
390:     letterSpacing: 1,
391:   },
392:   progressContainer: {
393:     height: 4,
394:     backgroundColor: 'rgba(255, 255, 255, 0.1)',
395:     borderRadius: 2,
396:     overflow: 'hidden',
397:     width: '100%',
398:   },
399:   progressFill: {
400:     height: '100%',
401:     backgroundColor: GOLD,
402:     borderRadius: 2,
403:   },
404: 
405:   // ── Sentence list ───────────────────────────────────────────────────────
406:   listContent: {
407:     paddingVertical: 24,
408:     paddingBottom: 120, // Extra space for bottom sheet
409:   },
410:   cardContainer: {
411:     marginBottom: 24,
412:     alignItems: 'center',
413:   },
414: 
415:   // ── Sentence Card (glassmorphic) ────────────────────────────────────────
416:   sentenceCard: {
417:     width: CARD_WIDTH,
418:     backgroundColor: 'rgba(15, 5, 24, 0.6)',
419:     borderRadius: 24,
420:     padding: 24,
421:     borderWidth: 1,
422:     borderColor: 'rgba(55, 65, 81, 0.6)',
423:     shadowColor: '#000',
424:     shadowOffset: { width: 0, height: 4 },
425:     shadowOpacity: 0.3,
426:     shadowRadius: 8,
427:     elevation: 8,
428:   },
429:   cardHeader: {
430:     flexDirection: 'row',
431:     justifyContent: 'space-between',
432:     alignItems: 'center',
433:     marginBottom: 16,
434:   },
435:   cardHeaderLabel: {
436:     fontSize: 10,
437:     fontWeight: 'bold',
438:     letterSpacing: 2,
439:     color: GOLD,
440:     textTransform: 'uppercase',
441:     fontFamily: 'NeueHaasGrotesk-Display',
442:   },
443:   cardHeaderRight: {
444:     flexDirection: 'row',
445:     alignItems: 'center',
446:     gap: 12,
447:   },
448:   pneumaButton: {
449:     flexDirection: 'row',
450:     alignItems: 'center',
451:     gap: 4,
452:     backgroundColor: 'rgba(197, 160, 89, 0.1)',
453:     borderRadius: 8,
454:     paddingHorizontal: 8,
455:     paddingVertical: 4,
456:   },
457:   pneumaIcon: {
458:     fontSize: 12,
459:     color: GOLD,
460:   },
461:   pneumaLabel: {
462:     fontFamily: 'NeueHaasGrotesk-Display',
463:     fontSize: 8,
464:     fontWeight: 'bold',
465:     color: GOLD,
466:     textTransform: 'uppercase',
467:     letterSpacing: 1,
468:   },
469:   cardSource: {
470:     fontFamily: 'NeueHaasGrotesk-Text',
471:     fontSize: 10,
472:     color: GRAY_TEXT,
473:     fontStyle: 'italic',
474:     maxWidth: '50%',
475:   },
476: 
477:   // ── Knot Row ────────────────────────────────────────────────────────────
478:   knotRow: {
479:     flexDirection: 'row',
480:     flexWrap: 'wrap',
481:     alignItems: 'flex-end',
482:     justifyContent: 'center',
483:     marginBottom: 24,
484:   },
485:   knotWrapper: {
486:     flexDirection: 'row',
487:     alignItems: 'flex-end',
488:   },
489:   knotChip: {
490:     marginRight: 6,
491:     marginBottom: 8,
492:     paddingHorizontal: 4,
493:     paddingVertical: 4,
494:     alignItems: 'center',
495:   },
496:   knotChipActive: {
497:     backgroundColor: GOLD,
498:     borderRadius: 8,
499:   },
500:   knotText: {
501:     fontSize: 22,
502:     fontFamily: 'GFSDidot',
503:     textAlign: 'center',
504:   },
505:   knotTextActive: {
506:     color: '#1a1918',
507:   },
508:   knotTextNormal: {
509:     color: PARCHMENT,
510:   },
511:   // The Byzantine Gold underline beneath each knot word
512:   knotUnderline: {
513:     height: 2,
514:     width: '100%',
515:     borderRadius: 1,
516:     marginTop: 2,
517:   },
518:   knotTranslit: {
519:     fontSize: 10,
520:     fontStyle: 'italic',
521:     marginTop: 1,
522:     fontFamily: 'NeueHaasGrotesk-Text',
523:     textAlign: 'center',
524:   },
525:   knotTranslitActive: {
526:     color: 'rgba(26, 25, 24, 0.6)',
527:   },
528:   knotTranslitNormal: {
529:     color: '#6B7280',
530:   },
531:   punctuation: {
532:     fontSize: 22,
533:     color: PARCHMENT,
534:     fontFamily: 'GFSDidot',
535:     alignSelf: 'flex-end',
536:     marginBottom: 8,
537:     marginRight: 4,
538:   },
539:   plainWord: {
540:     fontSize: 22,
541:     color: 'rgba(227, 220, 203, 0.45)',
542:     fontFamily: 'GFSDidot',
543:     marginRight: 6,
544:     marginBottom: 8,
545:     alignSelf: 'flex-end',
546:   },
547: 
548:   // ── Translation ─────────────────────────────────────────────────────────
549:   translationContainer: {
550:     paddingTop: 16,
551:     borderTopWidth: 1,
552:     borderTopColor: 'rgba(31, 41, 55, 0.6)',
553:   },
554:   translationText: {
555:     fontSize: 14,
556:     color: GRAY_TEXT,
557:     fontStyle: 'italic',
558:     textAlign: 'center',
559:     lineHeight: 20,
560:     fontFamily: 'GFSDidot',
561:   },
562: 
563:   // ── Rationale (Grammar Scholia Teaser) ──────────────────────────────────
564:   rationaleContainer: {
565:     marginTop: 12,
566:     paddingTop: 10,
567:     borderTopWidth: 1,
568:     borderTopColor: 'rgba(31, 41, 55, 0.4)',
569:   },
570:   rationaleLabel: {
571:     fontFamily: 'NeueHaasGrotesk-Display',
572:     fontSize: 8,
573:     fontWeight: 'bold',
574:     color: GOLD,
575:     textTransform: 'uppercase',
576:     letterSpacing: 1.5,
577:     marginBottom: 4,
578:   },
579:   rationaleText: {
580:     fontFamily: 'NeueHaasGrotesk-Text',
581:     fontSize: 12,
582:     color: 'rgba(227, 220, 203, 0.55)',
583:     fontStyle: 'italic',
584:     lineHeight: 18,
585:   },
586: 
587:   // ── Level badge ─────────────────────────────────────────────────────────
588:   levelBadge: {
589:     position: 'absolute',
590:     top: 12,
591:     right: 12,
592:     backgroundColor: GOLD_DIM,
593:     paddingHorizontal: 8,
594:     paddingVertical: 3,
595:     borderRadius: 6,
596:   },
597:   levelBadgeText: {
598:     fontFamily: 'NeueHaasGrotesk-Display',
599:     fontSize: 9,
600:     fontWeight: 'bold',
601:     color: GOLD,
602:     letterSpacing: 1,
603:   },
604: });

(End of file - total 604 lines)
</content>
```

---

## Assistant (Build · Qwen3.6-27B-4bit · 30.3s)

_Thinking:_


Now let me read the color scheme hooks and the unifiedInspectorStore to understand the full bridge pattern.








**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-color-scheme.ts"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-color-scheme.ts</path>
<type>file</type>
<content>
1: export { useColorScheme } from 'react-native';

(End of file - total 1 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-color-scheme.web.ts"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-color-scheme.web.ts</path>
<type>file</type>
<content>
1: import { useEffect, useState } from 'react';
2: import { useColorScheme as useRNColorScheme } from 'react-native';
3: 
4: /**
5:  * To support static rendering, this value needs to be re-calculated on the client side for web
6:  */
7: export function useColorScheme() {
8:   const [hasHydrated, setHasHydrated] = useState(false);
9: 
10:   useEffect(() => {
11:     setHasHydrated(true);
12:   }, []);
13: 
14:   const colorScheme = useRNColorScheme();
15: 
16:   if (hasHydrated) {
17:     return colorScheme;
18:   }
19: 
20:   return 'light';
21: }

(End of file - total 21 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/store/unifiedInspectorStore.ts"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/store/unifiedInspectorStore.ts</path>
<type>file</type>
<content>
1: // ── THE UNIFIED INSPECTOR STORE ──────────────────────────────────────────────
2: // Merges the old philologicalInspectorStore + inspectorStore into one.
3: // Drives the single PhilologicalInspector bottom sheet with Progressive Disclosure.
4: //
5: // Key design:
6: // - profileCache: persisted Map<lemma, ContrastiveProfile> for offline access
7: // - disclosureLevel: 'translation' → 'audio' → 'knot' → 'etymology'
8: // - "Shallow Knot" resilience: accepts both Knot and Token-shaped objects
9: //   without crashing on missing fields (david_note, grammar_scholia, etc.)
10: 
11: import { create } from 'zustand';
12: import { persist } from 'zustand/middleware';
13: import { resilientStorage } from './storage';
14: import { Knot, ContrastiveProfile, DisclosureLevel } from '../types';
15: import { ApiService } from '../services/ApiService';
16: 
17: // ── Shallow Knot Adapter ────────────────────────────────────────────────────
18: // Token objects from constellation.tsx / results.tsx lack david_note, rag_scholia.
19: // This normalizes any word-like object into a safe Knot shape.
20: 
21: interface ShallowWordlike {
22:   text: string;
23:   lemma: string;
24:   pos: string;
25:   tag?: string;
26:   transliteration?: string;
27:   morphology?: string[];
28:   definition?: string;
29:   david_note?: string;
30:   rag_scholia?: string;
31:   grammar_scholia?: string;
32:   lsj_definitions?: string[];
33:   kds_score?: number;
34:   ancient_ancestor?: string;
35:   has_paradigm?: boolean;
36:   paradigm?: { form: string; tags: string[] }[];
37:   [key: string]: any; // Allow extra Token fields (knot_definition, etc.)
38: }
39: 
40: export function toKnot(word: ShallowWordlike, id?: string): Knot {
41:   return {
42:     id: id ?? `knot-${word.lemma}-${Date.now()}`,
43:     text: word.text,
44:     lemma: word.lemma,
45:     pos: word.pos,
46:     tag: word.tag,
47:     transliteration: word.transliteration,
48:     morphology: word.morphology,
49:     definition: word.definition ?? word.knot_definition,
50:     david_note: word.david_note ?? '',
51:     rag_scholia: word.rag_scholia ?? '',
52:     grammar_scholia: word.grammar_scholia,
53:     lsj_definitions: word.lsj_definitions,
54:     kds_score: word.kds_score,
55:     ancient_ancestor: word.ancient_ancestor,
56:     has_paradigm: word.has_paradigm,
57:     paradigm: word.paradigm,
58:   };
59: }
60: 
61: // ── State Interface ─────────────────────────────────────────────────────────
62: 
63: interface UnifiedInspectorState {
64:   // What is being inspected
65:   knot: Knot | null;
66: 
67:   // Sheet state
68:   isOpen: boolean;
69:   isLoading: boolean;
70:   inspectError: 'void' | 'network' | null;
71: 
72:   // Progressive disclosure level (replaces 3-tab model)
73:   disclosureLevel: DisclosureLevel;
74: 
75:   // ContrastiveProfile cache — keyed by lemma
76:   // Persisted via AsyncStorage for offline access
77:   profileCache: Record<string, ContrastiveProfile>;
78: 
79:   // Actions
80:   openInspector: (knot: Knot | ShallowWordlike, level?: DisclosureLevel) => void;
81:   closeInspector: () => void;
82:   setDisclosureLevel: (level: DisclosureLevel) => void;
83:   clearCache: () => void;
84: }
85: 
86: // ── The Store ───────────────────────────────────────────────────────────────
87: 
88: export const useInspectorStore = create<UnifiedInspectorState>()(
89:   persist(
90:     (set, get) => ({
91:       knot: null,
92:       isOpen: false,
93:       isLoading: false,
94:       inspectError: null,
95:       disclosureLevel: 'translation',
96:       profileCache: {},
97: 
98:       openInspector: async (wordlike, level = 'translation') => {
99:         // Normalize to Knot (Shallow Knot Adapter)
100:         const knot = 'id' in wordlike && 'david_note' in wordlike && typeof wordlike.david_note === 'string'
101:           ? (wordlike as Knot)
102:           : toKnot(wordlike as ShallowWordlike);
103: 
104:         // Check 1: Is the ContrastiveProfile already on the knot?
105:         const hasProfile = !!(knot.grammar_scholia && knot.david_note && knot.rag_scholia);
106: 
107:         // Check 2: Is it in the cache?
108:         const cached = get().profileCache[knot.lemma];
109: 
110:         if (hasProfile) {
111:           // Knot is fully enriched — open instantly
112:           set({ knot, isOpen: true, disclosureLevel: level, isLoading: false, inspectError: null });
113:           return;
114:         }
115: 
116:         if (cached) {
117:           // Enrich from cache — no API call
118:           const enriched = enrichKnot(knot, cached);
119:           set({ knot: enriched, isOpen: true, disclosureLevel: level, isLoading: false, inspectError: null });
120:           return;
121:         }
122: 
123:         // No cache — open sheet immediately with what we have, then fetch
124:         set({ knot, isOpen: true, disclosureLevel: level, isLoading: true, inspectError: null });
125: 
126:         if (!knot.lemma) {
127:           set({ isLoading: false });
128:           return;
129:         }
130: 
131:         try {
132:           const profile = await ApiService.inspectLemma(knot.lemma);
133: 
134:           if (profile === null) {
135:             // Philological Void — the diachronic link is lost to time
136:             set({ isLoading: false, inspectError: 'void' });
137:             return;
138:           }
139: 
140:           // Enrich the knot and update cache
141:           set((state) => {
142:             // Only update if the same knot is still open (prevent stale writes)
143:             if (state.knot && state.knot.lemma === knot.lemma) {
144:               return {
145:                 knot: enrichKnot(state.knot, profile),
146:                 isLoading: false,
147:                 profileCache: {
148:                   ...state.profileCache,
149:                   [knot.lemma]: profile,
150:                 },
151:               };
152:             }
153:             // Knot changed while fetching — still cache the profile
154:             return {
155:               isLoading: false,
156:               profileCache: {
157:                 ...state.profileCache,
158:                 [knot.lemma]: profile,
159:               },
160:             };
161:           });
162:         } catch (e) {
163:           console.error('[Inspector] GET /inspect/{lemma} failed:', e);
164:           set({ isLoading: false, inspectError: 'network' });
165:         }
166:       },
167: 
168:       closeInspector: () => set({ isOpen: false, inspectError: null }),
169:       // Keep knot for closing animation — cleared on next open
170: 
171:       setDisclosureLevel: (level) => set({ disclosureLevel: level }),
172: 
173:       clearCache: () => set({ profileCache: {} }),
174:     }),
175:     {
176:       name: 'inspector-profile-cache',
177:       storage: resilientStorage,
178:       // Only persist the profile cache — not the sheet UI state
179:       partialize: (state) => ({ profileCache: state.profileCache }),
180:     },
181:   ),
182: );
183: 
184: // ── Helpers ──────────────────────────────────────────────────────────────────
185: 
186: /** Enrich a Knot with data from a ContrastiveProfile. */
187: function enrichKnot(knot: Knot, profile: ContrastiveProfile): Knot {
188:   // Map API collocations (text + frequency) → Knot ngrams (string[])
189:   const ngrams = profile.collocations?.length
190:     ? profile.collocations.map((c) => c.text)
191:     : knot.ngrams;
192: 
193:   return {
194:     ...knot,
195:     david_note: profile.david_note || knot.david_note,
196:     rag_scholia: profile.rag_scholia || knot.rag_scholia,
197:     grammar_scholia: profile.grammar_scholia,
198:     lsj_definitions: profile.lsj_definitions,
199:     kds_score: profile.kds_score,
200:     paradigm: profile.paradigm,
201:     has_paradigm: Array.isArray(profile.paradigm) && profile.paradigm.length > 0,
202:     ancient_ancestor: profile.ancient_ancestor ?? knot.ancient_ancestor,
203:     idioms: profile.idioms ?? knot.idioms,
204:     ngrams,
205:   };
206: }
207: 
208: // ── Legacy Compatibility ─────────────────────────────────────────────────────
209: // Re-export the old store name for consumers that haven't been updated yet.
210: export const usePhilologicalInspectorStore = useInspectorStore;

(End of file - total 210 lines)
</content>
```

---

## Assistant (Build · Qwen3.6-27B-4bit · 17.5s)

_Thinking:_


Now let me also check the curriculumStore and voyageStore for any hook usage, and look at how theme.ts is structured.







**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/theme.ts"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/theme.ts</path>
<type>file</type>
<content>
1: import { MD3DarkTheme, configureFonts } from 'react-native-paper';
2: 
3: // ── Philological Design Tokens (Aesthetic Sovereignty) ──────────────────────
4: // Centralized here to eliminate scattered re-declarations across components.
5: // Every component should import from this file instead of declaring its own.
6: 
7: export const PhilologicalColors = {
8:   // ── Tactile Void Palette ────────────────────────────────────────────────
9:   VOID: '#0a0f0d',              // Deep emerald-black (was purple-black)
10:   VOID_DEEP: '#060a08',        // Near-true black with green undertone
11:   VOID_WARM: '#0d0907',        // Warm rust-black for gradient mixing
12:   GOLD: '#C5A059',
13:   GOLD_DIM: 'rgba(197, 160, 89, 0.15)',
14:   GOLD_GLOW: 'rgba(197, 160, 89, 0.35)',
15:   PARCHMENT: '#E3DCCB',
16:   INK: '#111413',              // Deep ink with green-charcoal undertone
17:   SURFACE: 'rgba(10, 15, 13, 0.4)',
18:   SURFACE_HEAVY: 'rgba(10, 15, 13, 0.65)',
19:   GRAY_TEXT: '#9CA3AF',
20:   GRAY_BORDER: 'rgba(55, 65, 81, 0.6)',
21:   MORPH_BG: 'rgba(120, 53, 15, 0.3)',
22:   MORPH_BORDER: 'rgba(180, 83, 9, 0.6)',
23:   MORPH_TEXT: '#FCD34D',
24:   SCHOLIA_BG: '#f4f1ea',
25:   SCHOLIA_BORDER: '#d6cfc0',
26:   SCHOLIA_TEXT: '#5D4037',
27:   ERROR: '#EF4444',
28:   SUCCESS: '#34D399',
29: 
30:   // ── Orrery Jewel Tones (DEPRECATED — use ORRERY_PIGMENTS) ──────────────
31:   JEWEL_TEAL: '#4A8C82',       // @deprecated
32:   JEWEL_RUST: '#A0644B',       // @deprecated
33:   JEWEL_GOLD: '#B89B5E',       // @deprecated
34:   JEWEL_SLATE: '#6B7B8D',      // @deprecated
35:   EDGE_MUTED: 'rgba(255, 255, 255, 0.12)', // @deprecated
36: } as const;
37: 
38: // ── Orrery: Faded Antiquity Pigments ────────────────────────────────────────
39: // Official palette derived from historical mineral/organic pigments.
40: // Replaces the deprecated "jewel-tone" system entirely.
41: export const ORRERY_PIGMENTS = {
42:   ELECTRUM:        '#DFCE9F',  // Center — alloyed gold of antiquity
43:   FADED_CINNABAR:  '#D5A096',  // LSJ / Ancient — oxidised red mercury pigment
44:   MUREX_ASH:       '#B5A3C4',  // Modern / METIS·Kaikki — ash of the sea-snail dye
45:   VERDIGRIS_CHALK: '#A1B8A0',  // Idiom / MWE — copper carbonate on limestone
46:   EGYPTIAN_FRIT:   '#93A8BA',  // Collocation / HNC — the world's first synthetic pigment
47: } as const;
48: 
49: export const PhilologicalFonts = {
50:   DISPLAY: 'GFSDidot',
51:   BODY: 'NeueHaasGrotesk',
52:   LABEL: 'NeueHaasGrotesk',
53: } as const;
54: 
55: const fontConfig = {
56:   displayLarge: { fontFamily: 'GFSDidot' },
57:   displayMedium: { fontFamily: 'GFSDidot' },
58:   displaySmall: { fontFamily: 'GFSDidot' },
59:   headlineLarge: { fontFamily: 'GFSDidot' },
60:   headlineMedium: { fontFamily: 'GFSDidot' },
61:   headlineSmall: { fontFamily: 'GFSDidot' },
62:   titleLarge: { fontFamily: 'GFSDidot' },
63:   titleMedium: { fontFamily: 'GFSDidot' },
64:   titleSmall: { fontFamily: 'GFSDidot' },
65:   labelLarge: { fontFamily: 'NeueHaasGrotesk' },
66:   labelMedium: { fontFamily: 'NeueHaasGrotesk' },
67:   labelSmall: { fontFamily: 'NeueHaasGrotesk' },
68:   bodyLarge: { fontFamily: 'NeueHaasGrotesk' },
69:   bodyMedium: { fontFamily: 'NeueHaasGrotesk' },
70:   bodySmall: { fontFamily: 'NeueHaasGrotesk' },
71: };
72: 
73: export const ScriptoriumTheme = {
74:   ...MD3DarkTheme,
75:   fonts: configureFonts({ config: fontConfig }),
76:   colors: {
77:     ...MD3DarkTheme.colors,
78:     primary: '#C0A062', // Antique Gold
79:     onPrimary: '#1a1918',
80:     secondary: '#B39DDB', // Ancient Purple
81:     onSecondary: '#1a1918',
82:     tertiary: '#C0A062',
83:     onTertiary: '#1a1918',
84:     background: '#111413', // Deep Ink - Global App Background
85:     onBackground: '#e3dccb', // Warm Parchment
86:     surface: '#181c1a', // Slightly lighter Ink with emerald undertone
87:     onSurface: '#e3dccb',
88:     onSurfaceVariant: 'rgba(227, 220, 203, 0.6)',
89:     elevation: {
90:       level1: '#181c1a',
91:       level2: '#181c1a',
92:       level3: '#181c1a',
93:       level4: '#181c1a',
94:       level5: '#181c1a',
95:     },
96:   },
97: };
98: 
99: /**
100:  * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
101:  * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
102:  */
103: 
104: const tintColorLight = '#0a7ea4';
105: const tintColorDark = '#fff';
106: 
107: export const Colors = {
108:   light: {
109:     text: '#11181C',
110:     background: '#fff',
111:     tint: tintColorLight,
112:     icon: '#2b4050',
113:     tabIconDefault: '#85a5c2',
114:     tabIconSelected: tintColorLight,
115:   },
116:   dark: {
117:     text: '#ECEDEE',
118:     background: '#151718',
119:     tint: tintColorDark,
120:     icon: '#4e363e',
121:     tabIconDefault: '#3b2b34',
122:     tabIconSelected: tintColorDark,
123:   },
124: };

(End of file - total 124 lines)
</content>
```

**Tool: grep**

**Input:**
```json
{
  "include": "*.ts*",
  "pattern": "useInspectorStore|useVoyageStore|useAuthStore|useCurriculumStore"
}
```

**Output:**
```
Found 23 matches
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/voyage/[id].tsx:
  Line 19: import { useInspectorStore } from '../../src/store/unifiedInspectorStore';

  Line 20: import { getCurrentSentence, getSentenceCount, useVoyageStore } from '../../src/store/voyageStore';

  Line 31:   const { manifest, isLoading: loading, error, loadVoyageById, nextSentence, previousSentence } = useVoyageStore();

  Line 32:   const { knot: activeKnot, openInspector } = useInspectorStore();

  Line 55:     setHasHydrated(useVoyageStore.persist.hasHydrated());

  Line 58:     const unsub = useVoyageStore.persist.onFinishHydration(() => {


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/orrery/[lemma].tsx:
  Line 12: import { useInspectorStore } from '../../src/store/unifiedInspectorStore';

  Line 272:   const openInspector = useInspectorStore((s) => s.openInspector);


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/store/voyageStore.ts:
  Line 77: export const useVoyageStore = create<VoyageState>()(


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/store/authStore.ts:
  Line 38: export const useAuthStore = create<AuthState>((set, get) => ({


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/store/unifiedInspectorStore.ts:
  Line 88: export const useInspectorStore = create<UnifiedInspectorState>()(

  Line 210: export const usePhilologicalInspectorStore = useInspectorStore;


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/store/curriculumStore.ts:
  Line 18: export const useCurriculumStore = create<CurriculumState>((set) => ({


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/components/ui/PhilologicalInspector.tsx:
  Line 22: import { useInspectorStore } from '../../src/store/unifiedInspectorStore';

  Line 126:   } = useInspectorStore();


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/results.tsx:
  Line 9: import { useInspectorStore, toKnot } from '../src/store/unifiedInspectorStore';

  Line 22:   const { openInspector, closeInspector, knot: selectedToken } = useInspectorStore();


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/login.tsx:
  Line 17: import { useAuthStore } from '../src/store/authStore';

  Line 28:   const { signInWithGoogle, continueAsGuest, devBypass } = useAuthStore();


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/lapidary/[sentenceId].tsx:
  Line 22: import { getSentenceCount, useVoyageStore } from '../../src/store/voyageStore';

  Line 104:   const { manifest, markPracticed } = useVoyageStore();


/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/island/[id].tsx:
  Line 27: import { useInspectorStore } from '../../src/store/unifiedInspectorStore';

  Line 219:   const { knot: activeKnot, openInspector } = useInspectorStore();

```

---

## Assistant (Build · Qwen3.6-27B-4bit · 21.1s)

_Thinking:_


Now let me read the voyageStore and curriculumStore to understand the full picture, and also check how the island/[id].tsx uses useIslandData vs the stores.







**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/store/voyageStore.ts"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/store/voyageStore.ts</path>
<type>file</type>
<content>
1: // ── THE VOYAGE STORE ─────────────────────────────────────────────────────────
2: // Client-side sentence sequencer built on top of IslandDTO.sentences.
3: // No new backend endpoints — consumes the existing GET /islands/{id} data.
4: //
5: // Manages: sentence-by-sentence navigation, mastery tracking, position persistence.
6: // Persisted via Zustand persist middleware + resilient storage adapter.
7: 
8: import { create } from 'zustand';
9: import { persist } from 'zustand/middleware';
10: import { resilientStorage } from './storage';
11: import {
12:   CuratedSentenceDTO,
13:   IslandDTO,
14:   MasteryState,
15:   VoyageManifest,
16:   VoyageSentence,
17: } from '../types';
18: import { ApiService } from '../services/ApiService';
19: 
20: // ── State Interface ─────────────────────────────────────────────────────────
21: 
22: interface VoyageState {
23:   // The active voyage
24:   manifest: VoyageManifest | null;
25: 
26:   // Loading & error
27:   isLoading: boolean;
28:   error: string | null;
29: 
30:   // Actions
31:   loadVoyage: (island: IslandDTO) => void;
32:   /** Fetch island from API by ID and initialize the voyage. */
33:   loadVoyageById: (islandId: string) => Promise<void>;
34:   nextSentence: () => void;
35:   previousSentence: () => void;
36:   goToSentence: (index: number) => void;
37:   markSeen: (sentenceId: string) => void;
38:   markPracticed: (sentenceId: string) => void;
39:   markMastered: (sentenceId: string) => void;
40:   resetVoyage: () => void;
41: }
42: 
43: // ── Mastery Weight Map (for progress calculation) ────────────────────────────
44: 
45: const MASTERY_WEIGHT: Record<MasteryState, number> = {
46:   unseen: 0,
47:   seen: 0.33,
48:   practiced: 0.66,
49:   mastered: 1,
50: };
51: 
52: // ── Computed Helpers (pure functions, not in the store) ──────────────────────
53: 
54: /** Get the current sentence from a manifest, or null. */
55: export function getCurrentSentence(manifest: VoyageManifest | null): VoyageSentence | null {
56:   if (!manifest || manifest.sentences.length === 0) return null;
57:   return manifest.sentences[manifest.current_index] ?? null;
58: }
59: 
60: /** Calculate overall voyage progress as a percentage (0–100). */
61: export function getVoyageProgress(manifest: VoyageManifest | null): number {
62:   if (!manifest || manifest.sentences.length === 0) return 0;
63:   const total = manifest.sentences.reduce(
64:     (acc, s) => acc + MASTERY_WEIGHT[s.mastery],
65:     0,
66:   );
67:   return Math.round((total / manifest.sentences.length) * 100);
68: }
69: 
70: /** Get the total number of sentences in the voyage. */
71: export function getSentenceCount(manifest: VoyageManifest | null): number {
72:   return manifest?.sentences.length ?? 0;
73: }
74: 
75: // ── The Store ───────────────────────────────────────────────────────────────
76: 
77: export const useVoyageStore = create<VoyageState>()(
78:   persist(
79:     (set, get) => ({
80:       manifest: null,
81:       isLoading: false,
82:       error: null,
83: 
84:       loadVoyage: (island: IslandDTO) => {
85:         const existing = get().manifest;
86: 
87:         // Resume if we have a persisted voyage for this island
88:         if (existing && existing.island_id === island.id) {
89:           // Refresh sentence content (may have updated from backend)
90:           // but preserve mastery states and current_index
91:           const refreshed = mergeSentences(existing.sentences, island.sentences);
92:           set({
93:             manifest: { ...existing, sentences: refreshed },
94:             isLoading: false,
95:             error: null,
96:           });
97:           return;
98:         }
99: 
100:         // Fresh voyage: wrap each sentence with sequence_index + mastery: 'unseen'
101:         const sentences: VoyageSentence[] = island.sentences.map((s, i) => ({
102:           ...s,
103:           sequence_index: i,
104:           mastery: 'unseen' as MasteryState,
105:         }));
106: 
107:         set({
108:           manifest: {
109:             island_id: island.id,
110:             sentences,
111:             current_index: 0,
112:             started_at: new Date().toISOString(),
113:           },
114:           isLoading: false,
115:           error: null,
116:         });
117:       },
118: 
119:       loadVoyageById: async (islandId: string) => {
120:         const { loadVoyage, manifest } = get();
121: 
122:         // Skip fetch if we already have a manifest for this island
123:         if (manifest && manifest.island_id === islandId) {
124:           set({ isLoading: false, error: null });
125:           return;
126:         }
127: 
128:         set({ isLoading: true, error: null });
129: 
130:         try {
131:           const island = await ApiService.getIsland(islandId);
132:           loadVoyage(island);
133:         } catch (e: any) {
134:           console.error('[VoyageStore] API fetch failed:', e.message);
135:           set({ error: `API unreachable. (${e.message})` });
136:         } finally {
137:           // ALWAYS release the loader — even if storage or API throws.
138:           // Without this, the UI stays stuck on the ActivityIndicator.
139:           set({ isLoading: false });
140:         }
141:       },
142: 
143:       nextSentence: () => {
144:         const { manifest } = get();
145:         if (!manifest) return;
146:         const nextIdx = Math.min(manifest.current_index + 1, manifest.sentences.length - 1);
147: 
148:         // Auto-mark the sentence we're leaving as 'seen' (if still unseen)
149:         const sentences = [...manifest.sentences];
150:         if (sentences[manifest.current_index]?.mastery === 'unseen') {
151:           sentences[manifest.current_index] = {
152:             ...sentences[manifest.current_index],
153:             mastery: 'seen',
154:           };
155:         }
156: 
157:         set({ manifest: { ...manifest, sentences, current_index: nextIdx } });
158:       },
159: 
160:       previousSentence: () => {
161:         const { manifest } = get();
162:         if (!manifest) return;
163:         const prevIdx = Math.max(manifest.current_index - 1, 0);
164:         set({ manifest: { ...manifest, current_index: prevIdx } });
165:       },
166: 
167:       goToSentence: (index: number) => {
168:         const { manifest } = get();
169:         if (!manifest) return;
170:         const clamped = Math.max(0, Math.min(index, manifest.sentences.length - 1));
171:         set({ manifest: { ...manifest, current_index: clamped } });
172:       },
173: 
174:       markSeen: (sentenceId: string) => {
175:         updateMastery(set, get, sentenceId, 'seen');
176:       },
177: 
178:       markPracticed: (sentenceId: string) => {
179:         updateMastery(set, get, sentenceId, 'practiced');
180:       },
181: 
182:       markMastered: (sentenceId: string) => {
183:         updateMastery(set, get, sentenceId, 'mastered');
184:       },
185: 
186:       resetVoyage: () => {
187:         set({ manifest: null, isLoading: false, error: null });
188:       },
189:     }),
190:     {
191:       name: 'voyage-progress',
192:       storage: resilientStorage,
193:       // Persist the full manifest (includes mastery states + current_index)
194:       partialize: (state) => ({ manifest: state.manifest }),
195:     },
196:   ),
197: );
198: 
199: // ── Internal Helpers ─────────────────────────────────────────────────────────
200: 
201: /** Update mastery for a sentence, only if it's an advancement (never regress). */
202: function updateMastery(
203:   set: (fn: (s: VoyageState) => Partial<VoyageState>) => void,
204:   get: () => VoyageState,
205:   sentenceId: string,
206:   newMastery: MasteryState,
207: ) {
208:   const { manifest } = get();
209:   if (!manifest) return;
210: 
211:   const ORDER: MasteryState[] = ['unseen', 'seen', 'practiced', 'mastered'];
212:   const newIdx = ORDER.indexOf(newMastery);
213: 
214:   const sentences = manifest.sentences.map((s) => {
215:     if (s.id !== sentenceId) return s;
216:     const currentIdx = ORDER.indexOf(s.mastery);
217:     // Only advance, never regress
218:     if (newIdx > currentIdx) {
219:       return { ...s, mastery: newMastery };
220:     }
221:     return s;
222:   });
223: 
224:   set(() => ({ manifest: { ...manifest, sentences } }));
225: }
226: 
227: /** Merge fresh backend sentences with persisted mastery states. */
228: function mergeSentences(
229:   persisted: VoyageSentence[],
230:   fresh: CuratedSentenceDTO[],
231: ): VoyageSentence[] {
232:   const masteryMap = new Map<string, MasteryState>();
233:   persisted.forEach((s) => masteryMap.set(s.id, s.mastery));
234: 
235:   return fresh.map((s, i) => ({
236:     ...s,
237:     sequence_index: i,
238:     mastery: masteryMap.get(s.id) ?? 'unseen',
239:   }));
240: }

(End of file - total 240 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/store/curriculumStore.ts"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/store/curriculumStore.ts</path>
<type>file</type>
<content>
1: // ── Curriculum Store (The Library) ───────────────────────────────────────────
2: // Zustand store for the island curriculum.
3: // Fetches all islands from the backend; error state prevents silent crashes.
4: 
5: import { create } from 'zustand';
6: import { ApiService } from '../services/ApiService';
7: import { IslandDTO } from '../types';
8: 
9: interface CurriculumState {
10:   islands: IslandDTO[];
11:   isLoading: boolean;
12:   error: string | null;
13: 
14:   /** Fetch all curriculum islands from the backend. */
15:   fetchIslands: () => Promise<void>;
16: }
17: 
18: export const useCurriculumStore = create<CurriculumState>((set) => ({
19:   islands: [],
20:   isLoading: false,
21:   error: null,
22: 
23:   fetchIslands: async () => {
24:     set({ isLoading: true, error: null });
25:     try {
26:       const islands = await ApiService.getCurriculumIslands();
27:       set({ islands, isLoading: false });
28:     } catch (e) {
29:       const message = e instanceof Error ? e.message : 'Failed to load curriculum.';
30:       set({ islands: [], isLoading: false, error: message });
31:     }
32:   },
33: }));

(End of file - total 33 lines)
</content>
```

---

## Assistant (Build · Qwen3.6-27B-4bit · 18.6s)

_Thinking:_


Now I have a complete picture. Let me also check the voyage/[id].tsx to see how it uses the stores vs. the island/[id].tsx which uses useIslandData hook directly.






**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/voyage/[id].tsx",
  "limit": 80
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/voyage/[id].tsx</path>
<type>file</type>
<content>
1: // ── THE VOYAGE READER ─────────────────────────────────────────────────────────
2: // Duolingo-style Lexical Array architecture: sentences split into physical,
3: // separate word components wrapped in a flexbox. KnotWords in Byzantine Gold.
4: // Tap a knot → PhilologicalInspector. Transliteration renders below each knot.
5: 
6: import { useLocalSearchParams, useRouter } from 'expo-router';
7: import { useCallback, useEffect, useState } from 'react';
8: import {
9:   ActivityIndicator,
10:   StyleSheet,
11:   Text,
12:   TouchableOpacity,
13:   View,
14: } from 'react-native';
15: import { IconButton } from 'react-native-paper';
16: import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
17: import { SafeAreaView } from 'react-native-safe-area-context';
18: import LexicalRenderer from '../../components/ui/LexicalRenderer';
19: import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
20: import { getCurrentSentence, getSentenceCount, useVoyageStore } from '../../src/store/voyageStore';
21: import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
22: import type { Knot } from '../../src/types';
23: 
24: // ── Main Screen ───────────────────────────────────────────────────────────────
25: 
26: export default function VoyageReader() {
27:   const router = useRouter();
28:   const { id } = useLocalSearchParams<{ id: string }>();
29: 
30:   // ── Data: fetch island via store (API with mock fallback) ───────────────
31:   const { manifest, isLoading: loading, error, loadVoyageById, nextSentence, previousSentence } = useVoyageStore();
32:   const { knot: activeKnot, openInspector } = useInspectorStore();
33: 
34:   useEffect(() => {
35:     // Guard: Expo Router passes the literal "[id]" during the initial unresolved render cycle.
36:     if (!id || id === '[id]') return;
37:     loadVoyageById(id);
38:   }, [id, loadVoyageById]);
39: 
40:   // ── Derived state ────────────────────────────────────────────────────────
41:   const sentence = getCurrentSentence(manifest);
42:   const total = getSentenceCount(manifest);
43:   const currentIndex = manifest?.current_index ?? 0;
44:   const isFirst = currentIndex === 0;
45:   const isLast = currentIndex >= total - 1;
46:   const showPractice = sentence?.mastery !== 'unseen';
47: 
48: 
49: 
50:   // ── Hydration State ──────────────────────────────────────────────────────
51:   const [hasHydrated, setHasHydrated] = useState(false);
52: 
53:   useEffect(() => {
54:     // Zustand's persist middleware might have already hydrated by the time this runs.
55:     setHasHydrated(useVoyageStore.persist.hasHydrated());
56: 
57:     // Listen for hydration finish if not yet hydrated.
58:     const unsub = useVoyageStore.persist.onFinishHydration(() => {
59:       setHasHydrated(true);
60:     });
61: 
62:     return () => {
63:       unsub();
64:     };
65:   }, []);
66: 
67:   // ── Handlers ─────────────────────────────────────────────────────────────
68:   const handleKnotPress = useCallback(
69:     (knot: Knot) => {
70:       openInspector(knot, 'knot');
71:     },
72:     [openInspector],
73:   );
74: 
75:   const handleNext = useCallback(() => {
76:     if (!isLast) nextSentence();
77:   }, [isLast, nextSentence]);
78: 
79:   const handlePrev = useCallback(() => {
80:     if (!isFirst) previousSentence();

(Showing lines 1-80 of 392. Use offset=81 to continue.)
</content>
```

---

## Assistant (Build · Qwen3.6-27B-4bit · 18.3s)

_Thinking:_


Now I have a complete picture. Let me analyze the hooks and their bridge patterns between stores and components. Let me also check how `useThemeColor` is used in the components that don't use the theme system properly.




Now I have all the context. Let me also check the `_layout.tsx` for the global theme provider setup:



**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/_layout.tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/_layout.tsx</path>
<type>file</type>
<content>
1: // ── ROOT LAYOUT (The Palimpsest Foundation) ──────────────────────────────────
2: // Boot sequence: Fonts → DB init → OmegaLoader → Cathedral
3: // Providers: SafeArea → GestureHandler → Paper → ThemeProvider(Dark) → Stack
4: // Global overlay: PhilologicalInspector (driven by unifiedInspectorStore)
5: //
6: // CRITICAL: ThemeProvider(DarkTheme) kills @react-navigation's DefaultTheme
7: // background of rgb(242, 242, 242). Without it the navigation container paints
8: // a white/grey hospital ward behind every transparent screen on web.
9: 
10: import AsyncStorage from '@react-native-async-storage/async-storage';
11: import { DarkTheme, ThemeProvider } from '@react-navigation/native';
12: import { useFonts } from 'expo-font';
13: import { Stack, useRouter } from 'expo-router';
14: import { StatusBar } from 'expo-status-bar';
15: import { useEffect, useState } from 'react';
16: import { Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
17: import { GestureHandlerRootView } from 'react-native-gesture-handler';
18: import { IconButton, PaperProvider } from 'react-native-paper';
19: import { SafeAreaProvider } from 'react-native-safe-area-context';
20: 
21: import { GlobalErrorBoundary } from '../components/ErrorBoundary';
22: import OmegaLoader from '../components/OmegaLoader';
23: import CosmicBackground from '../components/ui/CosmicBackground';
24: import PhilologicalInspector from '../components/ui/PhilologicalInspector';
25: import { API_BASE_URL } from '../src/services/apiConfig';
26: import { initDatabase } from '../src/services/Database';
27: import { PhilologicalColors, PhilologicalFonts, ScriptoriumTheme } from '../src/theme';
28: 
29: function DevScriptoriumOverlay() {
30:   const [isVisible, setIsVisible] = useState(false);
31:   const router = useRouter();
32: 
33:   const handlePing = () => {
34:     fetch(API_BASE_URL)
35:       .then((res) => {
36:         Alert.alert('Ping Backend', `Status: ${res.status} OK\nURL: ${API_BASE_URL}`);
37:       })
38:       .catch((e) => {
39:         Alert.alert('Ping Backend Failed', `URL: ${API_BASE_URL}\nError: ${e.message}`);
40:       });
41:   };
42: 
43:   const handleClearStorage = () => {
44:     AsyncStorage.clear()
45:       .then(() => Alert.alert('AsyncStorage Cleared', 'State has been purged.'))
46:       .catch((e) => Alert.alert('Error', e.message));
47:   };
48: 
49:   return (
50:     <>
51:       {/* Percentage line / Loading line at the very top */}
52:       <View style={styles.devTopLine} />
53: 
54:       {/* Floating Sentinel Button */}
55:       <View style={styles.devSentinelContainer}>
56:         <TouchableOpacity
57:           style={styles.devSentinelButton}
58:           onPress={() => setIsVisible(true)}
59:         >
60:           <IconButton icon="orbit" iconColor={PhilologicalColors.GOLD} size={28} />
61:         </TouchableOpacity>
62:       </View>
63: 
64:       {/* Dev Scriptorium Modal */}
65:       <Modal visible={isVisible} transparent animationType="fade">
66:         <View style={styles.devModalOverlay}>
67:           <View style={styles.devModalContent}>
68:             <Text style={styles.devModalTitle}>GOD-MODE OVERLAY</Text>
69: 
70:             <TouchableOpacity style={styles.devModalButton} onPress={() => { setIsVisible(false); router.push('/voyage/alpha-001'); }}>
71:               <Text style={styles.devModalButtonText}>Jump to Voyage (alpha-001)</Text>
72:             </TouchableOpacity>
73: 
74:             <TouchableOpacity style={styles.devModalButton} onPress={() => { setIsVisible(false); router.push('/lapidary/alpha-001'); }}>
75:               <Text style={styles.devModalButtonText}>Jump to Lapidary (alpha-001)</Text>
76:             </TouchableOpacity>
77: 
78:             <TouchableOpacity style={styles.devModalButton} onPress={() => { setIsVisible(false); router.push('/orrery'); }}>
79:               <Text style={styles.devModalButtonText}>Jump to Orrery</Text>
80:             </TouchableOpacity>
81: 
82:             <TouchableOpacity style={styles.devModalButton} onPress={handlePing}>
83:               <Text style={styles.devModalButtonText}>Diagnostic Hub (Ping Backend)</Text>
84:             </TouchableOpacity>
85: 
86:             <TouchableOpacity style={[styles.devModalButton, { borderColor: PhilologicalColors.ERROR }]} onPress={handleClearStorage}>
87:               <Text style={[styles.devModalButtonText, { color: PhilologicalColors.ERROR }]}>Clear AsyncStorage</Text>
88:             </TouchableOpacity>
89: 
90:             <TouchableOpacity style={styles.devModalClose} onPress={() => setIsVisible(false)}>
91:               <Text style={styles.devModalCloseText}>CLOSE</Text>
92:             </TouchableOpacity>
93:           </View>
94:         </View>
95:       </Modal>
96:     </>
97:   );
98: }
99: 
100: export default function RootLayout() {
101:   const isDevMode = process.env.EXPO_PUBLIC_DEV_MODE === 'true';
102:   const [isReady, setIsReady] = useState(false);
103: 
104:   const [fontsLoaded] = useFonts({
105:     'GFSDidot': require('../assets/fonts/GFSDidot.otf'),
106:     'NeueHaasGrotesk-Display': require('../assets/fonts/NeueHaasGrotesk.otf'),
107:     'NeueHaasGrotesk-Text': require('../assets/fonts/NeueHaasGrotesk.otf'),
108:   });
109: 
110:   // ── Web: inject global CSS foundation ───────────────────────────────────────
111:   // html/body/root must be 100% height or absoluteFill collapses to 0px on web.
112:   // background-color:#0a0f0d seals any remaining white bleed outside React tree.
113:   useEffect(() => {
114:     if (Platform.OS !== 'web') return;
115:     if (typeof document === 'undefined') return;
116:     if (document.getElementById('cosmic-foundation')) return;
117:     const style = document.createElement('style');
118:     style.id = 'cosmic-foundation';
119:     style.textContent = [
120:       'html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; background: #0a0f0d; }',
121:       '#root { height: 100%; background: #0a0f0d; }',
122:     ].join('\n');
123:     document.head.appendChild(style);
124:   }, []);
125: 
126:   useEffect(() => {
127:     initDatabase();
128:     const timer = setTimeout(() => {
129:       console.log('--- FAILSAFE TRIGGERED: Forcing Entry ---');
130:       setIsReady(true);
131:     }, 2000);
132:     return () => clearTimeout(timer);
133:   }, []);
134: 
135:   useEffect(() => {
136:     if (fontsLoaded) {
137:       console.log('--- FONTS LOADED ---');
138:       setIsReady(true);
139:     }
140:   }, [fontsLoaded]);
141: 
142:   // ── Boot Sequence: OmegaLoader ──────────────────────────────────────────────
143:   if (!isReady) {
144:     return (
145:       <View style={styles.loaderContainer}>
146:         <OmegaLoader />
147:       </View>
148:     );
149:   }
150: 
151:   // ── The Cathedral ────────────────────────────────────────────────────────────
152:   return (
153:     <GlobalErrorBoundary>
154:       <SafeAreaProvider>
155:         <View style={{ flex: 1, backgroundColor: PhilologicalColors.VOID }}>
156: 
157:           {/* LAYER 0: THE COSMOS — pinned absolutely behind everything */}
158:           <View style={StyleSheet.absoluteFill} pointerEvents="none">
159:             <CosmicBackground />
160:           </View>
161: 
162:           {/* LAYER 1: THE APP */}
163:           <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
164:             <PaperProvider theme={ScriptoriumTheme}>
165:               {/*
166:                * ThemeProvider(DarkTheme) MUST wrap the Stack.
167:                * It overrides @react-navigation's DefaultTheme (rgb(242,242,242))
168:                * with DarkTheme.colors.background = 'rgb(1, 1, 1)', keeping every
169:                * transparent screen from revealing a blinding grey canvas.
170:                */}
171:               <ThemeProvider value={DarkTheme}>
172:                 <StatusBar style="light" />
173: 
174:                 <Stack
175:                   screenOptions={{
176:                     headerShown: false,
177:                     contentStyle: { backgroundColor: 'transparent' },
178:                     animation: 'fade',
179:                   }}
180:                 >
181:                   <Stack.Screen name="index" />
182:                   <Stack.Screen name="(tabs)" />
183:                   <Stack.Screen name="voyage/[id]" />
184:                   <Stack.Screen name="orrery/index" />
185:                   <Stack.Screen name="orrery/[lemma]" />
186:                   <Stack.Screen name="lapidary/[sentenceId]" />
187:                 </Stack>
188: 
189:                 {/* LAYER 2: GLOBAL OVERLAY */}
190:                 <PhilologicalInspector />
191: 
192:                 {/* LAYER 3: GOD-MODE OVERLAY */}
193:                 {isDevMode && <DevScriptoriumOverlay />}
194: 
195:               </ThemeProvider>
196:             </PaperProvider>
197:           </GestureHandlerRootView>
198: 
199:         </View>
200:       </SafeAreaProvider>
201:     </GlobalErrorBoundary>
202:   );
203: }
204: 
205: const styles = StyleSheet.create({
206:   devTopLine: {
207:     position: 'absolute',
208:     top: 0,
209:     left: 0,
210:     width: '100%',
211:     height: 2,
212:     backgroundColor: PhilologicalColors.GOLD,
213:     zIndex: 9999,
214:   },
215:   devSentinelContainer: {
216:     position: 'absolute',
217:     bottom: 24,
218:     right: 24,
219:     zIndex: 9999,
220:   },
221:   devSentinelButton: {
222:     backgroundColor: 'rgba(15, 5, 24, 0.6)',
223:     borderRadius: 30,
224:     borderWidth: 1,
225:     borderColor: 'rgba(197, 160, 89, 0.4)',
226:     overflow: 'hidden',
227:   },
228:   devModalOverlay: {
229:     flex: 1,
230:     backgroundColor: 'rgba(0, 0, 0, 0.8)',
231:     justifyContent: 'center',
232:     alignItems: 'center',
233:   },
234:   devModalContent: {
235:     width: '80%',
236:     backgroundColor: PhilologicalColors.VOID,
237:     borderColor: PhilologicalColors.GOLD,
238:     borderWidth: 1,
239:     borderRadius: 12,
240:     padding: 24,
241:     gap: 12,
242:   },
243:   devModalTitle: {
244:     fontFamily: PhilologicalFonts.DISPLAY,
245:     fontSize: 20,
246:     color: PhilologicalColors.GOLD,
247:     textAlign: 'center',
248:     marginBottom: 12,
249:   },
250:   devModalButton: {
251:     paddingVertical: 12,
252:     paddingHorizontal: 16,
253:     backgroundColor: 'rgba(197, 160, 89, 0.1)',
254:     borderRadius: 8,
255:     borderWidth: 1,
256:     borderColor: 'rgba(197, 160, 89, 0.3)',
257:     alignItems: 'center',
258:   },
259:   devModalButtonText: {
260:     fontFamily: PhilologicalFonts.LABEL,
261:     fontSize: 14,
262:     color: PhilologicalColors.PARCHMENT,
263:   },
264:   devModalClose: {
265:     marginTop: 12,
266:     paddingVertical: 12,
267:     alignItems: 'center',
268:   },
269:   devModalCloseText: {
270:     fontFamily: PhilologicalFonts.LABEL,
271:     fontSize: 12,
272:     color: PhilologicalColors.GRAY_TEXT,
273:     letterSpacing: 1,
274:   },
275:   loaderContainer: {
276:     flex: 1,
277:     justifyContent: 'center',
278:     alignItems: 'center',
279:     backgroundColor: PhilologicalColors.VOID,
280:   },
281: });

(End of file - total 281 lines)
</content>
```

---

## Assistant (Build · Qwen3.6-27B-4bit · 329.3s)

_Thinking:_


Now I have all the context I need. Let me analyze the hooks and write the pathology report.

Key findings:

**useIslandData** (src/hooks/useIslandData.ts):
1. **Dual Data Path**: `island/[id].tsx` uses `useIslandData` directly (bypassing voyageStore), while `voyage/[id].tsx` uses `useVoyageStore.loadVoyageById()`. Both call `ApiService.getIsland()` but with different data handling. This is a **data path bifurcation** - the same API endpoint is consumed by two different mechanisms.

2. **State Fragmentation**: The hook uses 3 separate useState calls (island, loading, error) - classic state fragmentation anti-pattern. Should be a single discriminated union type.


3. **No Caching**: Every mount triggers an API call with no cache, so navigating away and back refetches the same island data unnecessarily.

4. **Stale Refetch**: The refetch callback uses fetchIsland in its dependency array, which means it's stable when islandId doesn't change, but it can still trigger stale data if the islandId changes between when refetch is called and when it executes.

5. **No Error Recovery**: The error state is terminal with no retry mechanism or exponential backoff built in.

6. **Inline Colors**: The component is using hardcoded color values instead of pulling from the theme system.

7. **Bypassing the Store**: The hook directly accesses the API, circumventing the voyageStore that should handle data flow.

8. **Mock Data Coupling**: The component has a direct dependency on MOCK_ISLAND, which shouldn't be exposed at the component level.

9. **Re-render Cascade**: The renderSentence function depends on activeKnot from the store, so any inspector state change triggers a full FlatList re-render across all visible sentences.

10. **useThemeColor**: This hook bridges the color scheme to theme colors, but it's not properly memoized...

The real issue is that `useThemeColor` returns primitive strings, so React can't memoize it effectively. When the color scheme changes, every component using it re-renders because the return value changes, even if the actual color hasn't. The native implementation just re-exports from React Native, but the web version adds hydration state that can cause mismatches.

Looking at the bigger picture, `useIslandData` creates a parallel data path that bypasses the store entirely, and the island component is littered with hardcoded colors that should come from the theme system instead.

The real problem is that `renderSentence` depends on `activeKnot` from the store, so any inspector state change triggers a complete re-render of the entire FlatList—all the SentenceCard and KnotWord components re-render even though only one knot's state actually changed.

There's also dual data paths for the same island endpoint: `useIslandData` in the island reader and `useVoyageStore.loadVoyageById` in the voyage reader, which means the same data is being fetched through two different mechanisms.

The theme system has a similar inconsistency—`useThemeColor` is an Expo template hook that bridges color scheme to theme colors, but it's only used in template components like `themed-text` and `themed-view`, while the actual app components pull directly from `PhilologicalColors` in the theme file, creating two parallel theming approaches.

Now I'll write up the pathology report.




Now I have the full picture. Let me save the analysis.



**Tool: lemma_memory_add**

**Input:**
```json
{
  "fragment": "[FAZ 4] - SINIR AĞLARI (HOOKS) OTOPSİSİ\n\n## TELSIZ HARİTASI\n3 hook dosyası incelenmiş:\n- `src/hooks/useIslandData.ts` — Island data fetch hook (42 satır)\n- `hooks/use-theme-color.ts` — Expo template theme bridge (21 satır)\n- `hooks/use-color-scheme.ts` / `.web.ts` — Platform-specific color scheme resolver\n\n---\n\n## PATHOLOGY 1: useIslandData — Dual Data Path Bifurcation (CRITICAL)\n\n**BULGU**: `app/island/[id].tsx` useIslandData hook'u ile doğrudan API'den IslandDTO çekerken, `app/voyage/[id].tsx` aynı `ApiService.getIsland()` endpoint'ini `useVoyageStore.loadVoyageById()` üzerinden tüketiyor.\n\n**Mekanizm**:\n```\nisland/[id].tsx → useIslandData → ApiService.getIsland() → raw IslandDTO (FlatList)\nvoyage/[id].tsx → useVoyageStore.loadVoyageById → ApiService.getIsland() → VoyageManifest (single-sentence sequencer)\n```\n\n**Patoloji**: Aynı API endpoint'i, iki farklı veri yolundan tüketiliyor. `island/[id]` route'u voyageStore'u bypass ederek:\n- Mastery tracking yok (sentences unseen kalıyor)\n- Progress persistence yok (sayfa değişince sıfırlanıyor)\n- Cache yok (her mount API call)\n\n**Impact**: Kullanıcı `island/[id]` üzerinden okuma yaptığında, voyage progress kaybolur. Aynı ada sonra `voyage/[id]` ile girildiğinde baştan başlar.\n\n**RESTORATION**: `island/[id].tsx` route'unu kaldır veya voyageStore'a yönlendir. Eğer \"distraction-free reading\" amaçlı ayrı bir route ise, `useIslandData` yerine voyageStore'un `loadVoyageById` + `getCurrentSentence`/`getVoyageProgress` kullanmalı. Alternatif: `useIslandData`'yı voyageStore'un içine absorb et.\n\n---\n\n## PATHOLOGY 2: useIslandData — State Fragmentation (HIGH)\n\n**BULGU**: 3 ayrı useState: `island`, `loading`, `error` (line 15-17).\n\n```typescript\nconst [island, setIsland] = useState<IslandDTO | null>(null);\nconst [loading, setLoading] = useState(true);\nconst [error, setError] = useState<string | null>(null);\n```\n\n**Patoloji**: İlgili state'ler fragmente. Loading sırasında error null, error sırasında loading false — bu iki state'in senkronizasyonu manuel ve kırılgan.\n\n**RESTORATION**: Discriminated union type:\n```typescript\ntype IslandState =\n  | { status: 'loading' }\n  | { status: 'error'; error: string }\n  | { status: 'success'; island: IslandDTO };\n\nconst [state, setState] = useState<IslandState>({ status: 'loading' });\n```\n\n---\n\n## PATHOLOGY 3: useIslandData — Re-render Cascade via Store Bridge (CRITICAL)\n\n**BULGU**: `app/island/[id].tsx:219` — `const { knot: activeKnot, openInspector } = useInspectorStore()`\n\n`renderSentence` callback'i `activeKnot`'a bağımlı (line 242: `[activeKnot, handleKnotPress]`). Inspector'da herhangi bir state değişikliği (disclosureLevel, isLoading, profileCache update) → `activeKnot` referansı değişebilir → `renderSentence` yeniden oluşturulur → FlatList TÜM visible item'ları re-render eder.\n\n**Mekanizm**:\n```\nKnotWord press → openInspector(knot) → Zustand set({ knot, isOpen, ... })\n  → useInspectorStore subscriber'ları fire\n  → IslandWorkbench re-render (activeKnot değişti)\n  → renderSentence useCallback yeni referans (dependency değişti)\n  → FlatList renderItem değişti → TÜM SentenceCard'lar re-render\n  → Her SentenceCard'ın useMemo'leri (knotMap, tokens, grammarTeaser) tekrar çalışır\n```\n\n**Impact**: 10 sentence × 5 knot/sentence = 50 KnotWord component. Tek bir knot'a tap → 50 component re-render. 60fps pipeline kırılır.\n\n**RESTORATION**:\nA) Selector pattern: `const activeKnotId = useInspectorStore(s => s.knot?.id ?? null)` — sadece ID'yi subscribe et, object referans değişiminden koru.\nB) SentenceCard'a `activeKnotId` (string) prop olarak geç, `knot` object değil.\nC) KnotWord'ın `isActive` prop'unu `activeKnotId === knot.id` ile karşılaştır (pure comparison, referans equality değil).\n\n```typescript\n// island/[id].tsx içinde:\nconst activeKnotId = useInspectorStore((s) => s.knot?.id ?? null);\n\nconst renderSentence = useCallback(\n  ({ item }) => (\n    <SentenceCard\n      sentence={item}\n      activeKnotId={activeKnotId}  // string, stable reference\n      onKnotPress={handleKnotPress}\n    />\n  ),\n  [activeKnotId, handleKnotPress],  // activeKnotId değişmediyse re-render yok\n);\n```\n\n---\n\n## PATHOLOGY 4: useIslandData — No Cache, No Retry, Terminal Error (MEDIUM)\n\n**BULGU**: Her mount `fetchIsland()` çağrılır. Hiçbir cache stratejisi yok. Error durumunda kullanıcıya sadece statik bir mesaj gösterilir, retry mekanizması yok.\n\n```typescript\nuseEffect(() => {\n  fetchIsland();  // Her mount, her islandId değişiminde API call\n}, [fetchIsland]);\n```\n\n**RESTORATION**:\n- LRU cache (Map<lemma, { data, timestamp }>) + TTL (5 dakika)\n- Exponential backoff retry (max 3 attempt)\n- `refetch` manuel trigger + otomatik retry on network recovery\n\n---\n\n## PATHOLOGY 5: useIslandData — Inline Color Declaration (LOW)\n\n**BULGU**: `app/island/[id].tsx:36-40` — Hardcoded color constants:\n```typescript\nconst GOLD = '#C5A059';\nconst PARCHMENT = '#E3DCCB';\nconst GRAY_TEXT = '#9CA3AF';\n```\n\nAynı renkler `src/theme.ts:PhilologicalColors`'ta tanımlı. CLAUDE.md: \"Never declare colors inline.\"\n\n**RESTORATION**: `import { PhilologicalColors as C } from '../../src/theme'` ve `C.GOLD`, `C.PARCHMENT`, `C.GRAY_TEXT` kullan.\n\n---\n\n## PATHOLOGY 6: useThemeColor — Theme System Bifurcation (MEDIUM)\n\n**BULGU**: İki paralel tema sistemi mevcut:\n1. `hooks/use-theme-color.ts` → `Colors.light` / `Colors.dark` (Expo template defaults)\n2. `src/theme.ts` → `PhilologicalColors` + `ScriptoriumTheme` (app-specific)\n\n`useThemeColor` hook'u sadece 3 template component'te kullanılıyor (`themed-text.tsx`, `themed-view.tsx`, `parallax-scroll-view.tsx`). App'in geri kalanı `PhilologicalColors`'ı direkt import ediyor.\n\n**Patoloji**: `useThemeColor`'un döndürdüğü renkler (`#11181C`, `#fff`, `#151718`) app'in void palette'ı (`#0a0f0d`, `#E3DCCB`) ile çakışmıyor. Template component'ler kullanılırsa görsel tutarsızlık yaratır.\n\n**RESTORATION**: `useThemeColor`'ü deprecated markala veya PhilologicalColors'a map et. App dark-mode only olduğu için `useColorScheme`'ün light/dark toggle'ı anlamsız — `_layout.tsx:171`'de `ThemeProvider value={DarkTheme}` hardcoded.\n\n---\n\n## PATHOLOGY 7: useColorScheme.web — Hydration Mismatch Guard (LOW)\n\n**BULGU**: Web'de `useColorScheme` SSR hydration mismatch için `hasHydrated` state kullanıyor (line 8-18). App dark-mode only olduğu için bu guard gereksiz overhead.\n\n**RESTORATION**: App'in dark-only olduğunu biliyorsak, web hook'unu `return 'dark'` olarak sabitle. Veya `useColorScheme` kullanımını tamamen kaldır (app'de theme toggle yok).\n\n---\n\n## KÖPRÜ ANALİZİ: Hook → Store → Component Akışı\n\n```\n┌──────────────────┐         ┌──────────────────────┐         ┌──────────────────┐\n│  useIslandData   │──API───▶│   ApiService         │◀───JWT──│   authStore      │\n│  (island/[id])   │         │   getIsland(id)      │         │   (SUPPLY)       │\n└──────────────────┘         └──────────────────────┘         └──────────────────┘\n       │                                              │\n       ▼                                              ▼\n  IslandDTO (raw)                            Token Refresh\n       │                                       (Race condition!\n       ▼                                       - Faz 3'te tespit)\n  FlatList render\n       │\n       ▼\n┌──────────────────┐         ┌──────────────────────┐\n│  useInspectorStore│◀──set──│  KnotWord press      │\n│  (Zustand Persist)│         │  (DEMAND)            │\n│  profileCache     │──API───▶│  inspectLemma(lemma) │\n└──────────────────┘         └──────────────────────┘\n       │\n       ▼  ← RE-RENDER CASCADE BURADA!\n  activeKnot reference change\n       │\n       ▼\n  TÜM SentenceCard'lar re-render (Pathology 3)\n```\n\n**Köprüdeki kopukluk**: useIslandData → voyageStore arasında köprü YOK. useIslandData kendi isolated state'inde yaşıyor, voyageStore'dan habersiz. Bu, app'in iki farklı route'unda aynı ada farklı progress durumları göstermesine neden olur.\n\n---\n\n## ÖNCELİKLİ RESTORATION SIRASI\n\n1. **CRITICAL**: Pathology 3 — Selector pattern ile re-render cascade'i kır (1 satır değişikliği)\n2. **CRITICAL**: Pathology 1 — Dual data path'i unify et veya island route'unu voyage'a yönlendir\n3. **HIGH**: Pathology 2 — Discriminated union state\n4. **MEDIUM**: Pathology 4 — Cache + retry stratejisi\n5. **MEDIUM**: Pathology 6 — useThemeColor deprecated veya PhilologicalColors'a map\n6. **LOW**: Pathology 5 — Inline color'ları theme'den import et\n7. **LOW**: Pathology 7 — useColorScheme.web sabitle",
  "title": "[Faz 4] - Sinir Ağları (Hooks) Otopsisi",
  "description": "Hooks analizi: useIslandData dual data path bifurcation, re-render cascade via store bridge, state fragmentation, no cache/retry. useThemeColor theme bifurcation. 7 pathology tespit edildi.",
  "project": "kombyphantike-mobile"
}
```

**Output:**
```
Added fragment [m59d7c155d052] (project: kombyphantike-mobile): "[Faz 4] - Sinir Ağları (Hooks) Otopsisi"
Summary: Hooks analizi: useIslandData dual data path bifurcation, re-render cascade via store bridge, state fragmentation, no cache/retry. useThemeColor theme bifurcation. 7 pathology tespit edildi.
```

---

## Assistant (Build · Qwen3.6-27B-4bit · 153.2s)

_Thinking:_


The user asked me to analyze the hooks and save the results to memory. I've done that. Let me provide a concise summary.




Done. 7 pathology tespit edildi, `[m59d7c155d052]` ID ile kaydedildi.

**Özet:**

| # | Pathology | Severity | Hook |
|---|-----------|----------|------|
| 1 | Dual Data Path Bifurcation | **CRITICAL** | useIslandData vs voyageStore |
| 2 | State Fragmentation (3 useState) | **HIGH** | useIslandData |
| 3 | Re-render Cascade via Store Bridge | **CRITICAL** | useInspectorStore → FlatList |
| 4 | No Cache, No Retry, Terminal Error | **MEDIUM** | useIslandData |
| 5 | Inline Color Declaration | **LOW** | island/[id].tsx |
| 6 | Theme System Bifurcation | **MEDIUM** | useThemeColor vs PhilologicalColors |
| 7 | Hydration Mismatch Guard (overhead) | **LOW** | useColorScheme.web |

**En kritik bulgu:** `island/[id].tsx`'te `activeKnot` object referansını `useCallback` dependency'ye almak, inspector'daki her state değişikliğinde tüm FlatList item'ların re-render'ına neden oluyor. 1 satırlık selector pattern (`s => s.knot?.id`) ile çözülebilir.

---

## User

Harika. Şimdi Faz 5: İskelet ve Yönlendirme (App Flow) analizini yapıyoruz.
Görevin: Sadece app/_layout.tsx dosyasını ve app/ klasöründeki rota yapısını (islands -> orrery -> voyage) oku.
Rotalar arası veri aktarımı güvenli mi? Layout sarmalayıcıları (Provider'lar) doğru kurgulanmış mı?
Bulgularını ve çözümlerini [Faz 5] - Uygulama İskeleti ve Yönlendirme Otopsisi başlığıyla Lemma'ya (memory_add) kaydet. 

---

## Assistant (Build · Qwen3.6-27B-4bit · 7.4s)

_Thinking:_


The user wants me to analyze the app routing structure, layout providers, and data flow between routes. Let me read the relevant files.






**Tool: _modelcontextprotocol_server-filesystem_directory_tree**

**Input:**
```json
{
  "path": "app",
  "excludePatterns": [
    "**/*.test.*",
    "**/__snapshots__/**"
  ]
}
```

**Output:**
```
[
  {
    "name": "(tabs)",
    "type": "directory",
    "children": [
      {
        "name": "_layout.tsx",
        "type": "file"
      },
      {
        "name": "index.tsx",
        "type": "file"
      }
    ]
  },
  {
    "name": "_layout.tsx",
    "type": "file"
  },
  {
    "name": "index.tsx",
    "type": "file"
  },
  {
    "name": "island",
    "type": "directory",
    "children": [
      {
        "name": "[id].tsx",
        "type": "file"
      }
    ]
  },
  {
    "name": "lapidary",
    "type": "directory",
    "children": [
      {
        "name": "[sentenceId].tsx",
        "type": "file"
      }
    ]
  },
  {
    "name": "login.tsx",
    "type": "file"
  },
  {
    "name": "orrery",
    "type": "directory",
    "children": [
      {
        "name": "[lemma].tsx",
        "type": "file"
      },
      {
        "name": "index.tsx",
        "type": "file"
      }
    ]
  },
  {
    "name": "paywall.tsx",
    "type": "file"
  },
  {
    "name": "results.tsx",
    "type": "file"
  },
  {
    "name": "voyage",
    "type": "directory",
    "children": [
      {
        "name": "[id].tsx",
        "type": "file"
      }
    ]
  }
]
```

---

## Assistant (Build · Qwen3.6-27B-4bit · 28.7s)

_Thinking:_


Good, now I need to read all the route files to understand the data flow between them. Let me read them in parallel.














**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/index.tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/index.tsx</path>
<type>file</type>
<content>
1: // ── THE SHIPYARD (Island Archipelago) ────────────────────────────────────────
2: // The real entry point. Fetches curriculum islands from the API on mount,
3: // renders them as tappable IslandCards, and routes into Voyage on press.
4: // The Orrery search hub is accessible via the header magnifying glass.
5: 
6: import { Feather } from '@expo/vector-icons';
7: import { useRouter } from 'expo-router';
8: import { useCallback, useEffect, useState } from 'react';
9: import {
10:   ActivityIndicator,
11:   FlatList,
12:   Pressable,
13:   StyleSheet,
14:   Text,
15:   View,
16: } from 'react-native';
17: import { SafeAreaView } from 'react-native-safe-area-context';
18: 
19: import IslandCard from '../components/IslandCard';
20: import { ApiService } from '../src/services/ApiService';
21: import { PhilologicalColors as C, PhilologicalFonts as F } from '../src/theme';
22: import type { IslandDTO } from '../src/types';
23: 
24: export default function ShipyardScreen() {
25:   const router = useRouter();
26:   const [islands, setIslands] = useState<IslandDTO[]>([]);
27:   const [loading, setLoading] = useState(true);
28:   const [error, setError] = useState<string | null>(null);
29: 
30:   useEffect(() => {
31:     let cancelled = false;
32: 
33:     async function fetchIslands() {
34:       try {
35:         const data = await ApiService.getCurriculumIslands();
36:         if (!cancelled) {
37:           setIslands(data);
38:           setError(null);
39:         }
40:       } catch (e: any) {
41:         if (!cancelled) {
42:           setError(e?.message ?? 'Failed to load islands.');
43:         }
44:       } finally {
45:         if (!cancelled) setLoading(false);
46:       }
47:     }
48: 
49:     fetchIslands();
50:     return () => { cancelled = true; };
51:   }, []);
52: 
53:   const handleIslandPress = useCallback((id: string) => {
54:     try {
55:       console.log('[Shipyard] Navigating to voyage:', id);
56:       router.push(`/voyage/${id}`);
57:     } catch (e) {
58:       console.error('[Shipyard] Navigation failed for island:', id, e);
59:     }
60:   }, [router]);
61: 
62:   const handleLockedPress = useCallback(() => {
63:     router.push('/paywall');
64:   }, [router]);
65: 
66:   const renderItem = useCallback(({ item }: { item: IslandDTO }) => (
67:     <IslandCard
68:       id={item.id}
69:       title={item.title}
70:       level={item.level}
71:       progress={item.progress}
72:       status={item.progress >= 100 ? 'Mastered' : 'Draft'}
73:       locked={item.locked}
74:       onPress={item.locked ? () => handleLockedPress() : handleIslandPress}
75:     />
76:   ), [handleIslandPress, handleLockedPress]);
77: 
78:   // ── Render ──────────────────────────────────────────────────────────────────
79:   return (
80:     <SafeAreaView style={styles.safeArea}>
81:       {/* ── Header ──────────────────────────────────────────────────────────── */}
82:       <View style={styles.header}>
83:         <View style={styles.headerSpacer} />
84:         <Text style={styles.headerTitle}>The Archipelago</Text>
85:         <Pressable
86:           style={({ pressed }) => [styles.searchButton, pressed && styles.searchPressed]}
87:           onPress={() => router.push('/orrery')}
88:           accessibilityLabel="Open Orrery Search"
89:           accessibilityRole="button"
90:         >
91:           <Feather name="search" size={20} color={C.GOLD} />
92:         </Pressable>
93:       </View>
94: 
95:       {/* ── Body ────────────────────────────────────────────────────────────── */}
96:       {loading ? (
97:         <View style={styles.centerState}>
98:           <ActivityIndicator size="large" color={C.GOLD} />
99:           <Text style={styles.stateText}>Charting the archipelago…</Text>
100:         </View>
101:       ) : error ? (
102:         <View style={styles.centerState}>
103:           <Text style={styles.errorSymbol}>⚠</Text>
104:           <Text style={styles.stateText}>{error}</Text>
105:           <Pressable
106:             style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
107:             onPress={() => { setLoading(true); setError(null); ApiService.getCurriculumIslands().then(setIslands).catch((e) => setError(e?.message)).finally(() => setLoading(false)); }}
108:           >
109:             <Text style={styles.retryText}>Retry</Text>
110:           </Pressable>
111:         </View>
112:       ) : islands.length === 0 ? (
113:         <View style={styles.centerState}>
114:           <Text style={styles.voidSymbol}>∅</Text>
115:           <Text style={styles.stateText}>
116:             The Archipelago is uncharted.{'\n'}The cartographers are still at work.
117:           </Text>
118:         </View>
119:       ) : (
120:         <FlatList
121:           data={islands}
122:           renderItem={renderItem}
123:           keyExtractor={(item) => item.id}
124:           contentContainerStyle={styles.listContent}
125:           showsVerticalScrollIndicator={false}
126:         />
127:       )}
128:     </SafeAreaView>
129:   );
130: }
131: 
132: const styles = StyleSheet.create({
133:   safeArea: {
134:     flex: 1,
135:     backgroundColor: 'transparent',
136:   },
137:   header: {
138:     flexDirection: 'row',
139:     alignItems: 'center',
140:     justifyContent: 'space-between',
141:     paddingHorizontal: 20,
142:     paddingTop: 8,
143:     paddingBottom: 16,
144:     borderBottomWidth: 1,
145:     borderBottomColor: 'rgba(197, 160, 89, 0.15)',
146:     marginBottom: 8,
147:   },
148:   headerSpacer: {
149:     width: 36,
150:   },
151:   headerTitle: {
152:     fontFamily: F.DISPLAY,
153:     fontSize: 28,
154:     color: C.PARCHMENT,
155:     textAlign: 'center',
156:     letterSpacing: -0.5,
157:     flex: 1,
158:   },
159:   searchButton: {
160:     width: 36,
161:     height: 36,
162:     borderRadius: 18,
163:     borderWidth: 1,
164:     borderColor: C.GOLD_DIM,
165:     backgroundColor: C.SURFACE,
166:     alignItems: 'center',
167:     justifyContent: 'center',
168:   },
169:   searchPressed: {
170:     backgroundColor: C.GOLD_DIM,
171:     borderColor: C.GOLD,
172:   },
173:   listContent: {
174:     paddingTop: 8,
175:     paddingBottom: 40,
176:   },
177:   centerState: {
178:     flex: 1,
179:     justifyContent: 'center',
180:     alignItems: 'center',
181:     paddingHorizontal: 40,
182:     gap: 12,
183:   },
184:   stateText: {
185:     fontFamily: F.DISPLAY,
186:     fontSize: 16,
187:     color: C.GRAY_TEXT,
188:     fontStyle: 'italic',
189:     textAlign: 'center',
190:     lineHeight: 24,
191:   },
192:   voidSymbol: {
193:     fontFamily: F.DISPLAY,
194:     fontSize: 48,
195:     color: 'rgba(197, 160, 89, 0.3)',
196:   },
197:   errorSymbol: {
198:     fontSize: 36,
199:     color: C.ERROR,
200:   },
201:   retryButton: {
202:     marginTop: 8,
203:     paddingVertical: 10,
204:     paddingHorizontal: 24,
205:     borderWidth: 1,
206:     borderColor: 'rgba(197, 160, 89, 0.3)',
207:     borderRadius: 8,
208:     backgroundColor: 'rgba(197, 160, 89, 0.12)',
209:   },
210:   retryPressed: {
211:     backgroundColor: 'rgba(197, 160, 89, 0.25)',
212:     borderColor: C.GOLD,
213:   },
214:   retryText: {
215:     fontFamily: F.LABEL,
216:     fontSize: 12,
217:     fontWeight: 'bold',
218:     color: C.GOLD,
219:     letterSpacing: 1,
220:     textTransform: 'uppercase',
221:   },
222: });

(End of file - total 222 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/(tabs)/_layout.tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/(tabs)/_layout.tsx</path>
<type>file</type>
<content>
1: import { Slot } from 'expo-router';
2: 
3: // Single-screen group — Shipyard is the sole home tab.
4: // Tab bar removed as part of Sprint 2 Palimpsest transition.
5: export default function TabLayout() {
6:   return <Slot />;
7: }

(End of file - total 7 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/(tabs)/index.tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/(tabs)/index.tsx</path>
<type>file</type>
<content>
1: // ── THE SHIPYARD (The Archipelago) ────────────────────────────────────────────
2: // Pure display component — renders island data from the store.
3: // No API calls on boot. Data is injected via curriculumStore in a future sprint.
4: // Boot state is the Void — the cartographers are still at work.
5: 
6: import { useCallback } from 'react';
7: import {
8:   FlatList,
9:   StyleSheet,
10:   Text,
11:   View,
12: } from 'react-native';
13: import { SafeAreaView } from 'react-native-safe-area-context';
14: import { useRouter } from 'expo-router';
15: import IslandCard from '../../components/IslandCard';
16: import type { IslandDTO } from '../../src/types';
17: import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
18: 
19: // Static placeholder — replaced by curriculumStore.islands in Sprint 2.
20: const ISLANDS: IslandDTO[] = [];
21: 
22: export default function ShipyardScreen() {
23:   const router = useRouter();
24: 
25:   const handleIslandPress = useCallback((id: string) => {
26:     router.push({ pathname: '/voyage/[id]', params: { id } });
27:   }, [router]);
28: 
29:   const handleLockedPress = useCallback(() => {
30:     router.push('/paywall');
31:   }, [router]);
32: 
33:   const renderItem = useCallback(({ item }: { item: IslandDTO }) => (
34:     <IslandCard
35:       id={item.id}
36:       title={item.title}
37:       level={item.level}
38:       progress={item.progress}
39:       status={item.progress >= 100 ? 'Mastered' : 'Draft'}
40:       locked={item.locked}
41:       onPress={item.locked ? () => handleLockedPress() : handleIslandPress}
42:     />
43:   ), [handleIslandPress, handleLockedPress]);
44: 
45:   return (
46:     <SafeAreaView style={styles.safeArea}>
47:       <View style={styles.header}>
48:         <Text style={styles.headerTitle}>The Archipelago</Text>
49:       </View>
50: 
51:       {ISLANDS.length === 0 ? (
52:         <View style={styles.centerState}>
53:           <Text style={styles.voidSymbol}>∅</Text>
54:           <Text style={styles.voidText}>
55:             The Archipelago is uncharted.{'\n'}The cartographers are still at work.
56:           </Text>
57:         </View>
58:       ) : (
59:         <FlatList
60:           data={ISLANDS}
61:           renderItem={renderItem}
62:           keyExtractor={(item) => item.id}
63:           contentContainerStyle={styles.listContent}
64:           showsVerticalScrollIndicator={false}
65:         />
66:       )}
67:     </SafeAreaView>
68:   );
69: }
70: 
71: const styles = StyleSheet.create({
72:   safeArea: {
73:     flex: 1,
74:     backgroundColor: 'transparent',
75:   },
76:   header: {
77:     paddingHorizontal: 20,
78:     paddingTop: 8,
79:     paddingBottom: 16,
80:     borderBottomWidth: 1,
81:     borderBottomColor: 'rgba(197, 160, 89, 0.15)',
82:     marginBottom: 8,
83:   },
84:   headerTitle: {
85:     fontFamily: F.DISPLAY,
86:     fontSize: 28,
87:     color: C.PARCHMENT,
88:     textAlign: 'center',
89:     letterSpacing: -0.5,
90:   },
91:   listContent: {
92:     paddingTop: 8,
93:     paddingBottom: 40,
94:   },
95:   centerState: {
96:     flex: 1,
97:     justifyContent: 'center',
98:     alignItems: 'center',
99:     paddingHorizontal: 40,
100:     gap: 12,
101:   },
102:   voidSymbol: {
103:     fontFamily: F.DISPLAY,
104:     fontSize: 48,
105:     color: 'rgba(197, 160, 89, 0.3)',
106:   },
107:   voidText: {
108:     fontFamily: F.DISPLAY,
109:     fontSize: 16,
110:     color: C.GRAY_TEXT,
111:     fontStyle: 'italic',
112:     textAlign: 'center',
113:     lineHeight: 24,
114:   },
115: });

(End of file - total 115 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/orrery/index.tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/orrery/index.tsx</path>
<type>file</type>
<content>
1: import AsyncStorage from '@react-native-async-storage/async-storage';
2: import { useRouter } from 'expo-router';
3: import { useEffect, useState } from 'react';
4: import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
5: import { IconButton } from 'react-native-paper';
6: import { SafeAreaView } from 'react-native-safe-area-context';
7: import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
8: 
9: const RECENT_KEY = '@recent_discoveries';
10: 
11: export default function OrreryHubScreen() {
12:   const router = useRouter();
13:   const [query, setQuery] = useState('');
14:   const [recent, setRecent] = useState<string[]>([]);
15: 
16:   useEffect(() => {
17:     AsyncStorage.getItem(RECENT_KEY).then((data) => {
18:       if (data) {
19:         try {
20:           const parsed = JSON.parse(data);
21:           if (Array.isArray(parsed)) setRecent(parsed);
22:         } catch (e) { }
23:       }
24:     });
25:   }, []);
26: 
27:   const saveRecent = async (word: string) => {
28:     const updated = [word, ...recent.filter(w => w !== word)].slice(0, 5);
29:     setRecent(updated);
30:     await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
31:   };
32: 
33:   const handleSearch = () => {
34:     const trimmed = query.trim().toLowerCase();
35:     if (trimmed) {
36:       saveRecent(trimmed);
37:       router.push(`/orrery/${encodeURIComponent(trimmed)}`);
38:     }
39:   };
40: 
41:   const handleRecentPress = (word: string) => {
42:     setQuery(word);
43:     saveRecent(word);
44:     router.push(`/orrery/${encodeURIComponent(word)}`);
45:   };
46: 
47:   return (
48:     <SafeAreaView style={styles.safeArea}>
49:       <KeyboardAvoidingView
50:         style={styles.container}
51:         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
52:       >
53:         <View style={styles.header}>
54:           <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
55:             <IconButton icon="arrow-left" iconColor={C.GOLD} size={24} />
56:           </TouchableOpacity>
57:           <View style={styles.headerCenter}>
58:             <Text style={styles.eyebrow}>THE SEARCH HUB</Text>
59:             <Text style={styles.title}>Obsidian Orrery</Text>
60:           </View>
61:           <View style={{ width: 48 }} />
62:         </View>
63: 
64:         <View style={styles.searchSection}>
65:           <Text style={styles.prompt}>Enter a Greek lemma to trace its lineage</Text>
66:           <View style={styles.inputContainer}>
67:             <TextInput
68:               style={styles.input}
69:               value={query}
70:               onChangeText={setQuery}
71:               placeholder="e.g. κόσμος, λόγος..."
72:               placeholderTextColor="rgba(156, 163, 175, 0.5)"
73:               onSubmitEditing={handleSearch}
74:               autoCapitalize="none"
75:               autoCorrect={false}
76:               returnKeyType="search"
77:             />
78:             <TouchableOpacity
79:               style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
80:               onPress={handleSearch}
81:               disabled={!query.trim()}
82:             >
83:               <IconButton icon="magnify" iconColor={C.VOID} size={20} />
84:             </TouchableOpacity>
85:           </View>
86:         </View>
87: 
88:         {recent.length > 0 && (
89:           <View style={styles.recentSection}>
90:             <Text style={styles.recentTitle}>Recent Discoveries</Text>
91:             <FlatList
92:               data={recent}
93:               keyExtractor={(item) => item}
94:               renderItem={({ item }) => (
95:                 <TouchableOpacity style={styles.recentItem} onPress={() => handleRecentPress(item)}>
96:                   <IconButton icon="history" iconColor={C.GOLD_DIM} size={16} />
97:                   <Text style={styles.recentItemText}>{item}</Text>
98:                   <IconButton icon="chevron-right" iconColor="rgba(197, 160, 89, 0.3)" size={16} />
99:                 </TouchableOpacity>
100:               )}
101:               contentContainerStyle={styles.recentList}
102:               scrollEnabled={false}
103:             />
104:           </View>
105:         )}
106:       </KeyboardAvoidingView>
107:     </SafeAreaView>
108:   );
109: }
110: 
111: const styles = StyleSheet.create({
112:   safeArea: {
113:     flex: 1,
114:     backgroundColor: 'transparent',
115:   },
116:   container: {
117:     flex: 1,
118:   },
119:   header: {
120:     flexDirection: 'row',
121:     alignItems: 'center',
122:     paddingHorizontal: 8,
123:     paddingVertical: 12,
124:     borderBottomWidth: 1,
125:     borderBottomColor: 'rgba(197, 160, 89, 0.1)',
126:   },
127:   backButton: {
128:     width: 48,
129:     alignItems: 'center',
130:   },
131:   headerCenter: {
132:     flex: 1,
133:     alignItems: 'center',
134:   },
135:   eyebrow: {
136:     fontFamily: F.LABEL,
137:     fontSize: 10,
138:     color: C.GOLD,
139:     letterSpacing: 2,
140:     fontWeight: 'bold',
141:   },
142:   title: {
143:     fontFamily: F.DISPLAY,
144:     fontSize: 24,
145:     color: C.PARCHMENT,
146:     marginTop: 4,
147:   },
148:   searchSection: {
149:     padding: 24,
150:     gap: 16,
151:     marginTop: 40,
152:   },
153:   prompt: {
154:     fontFamily: F.DISPLAY,
155:     fontSize: 16,
156:     color: C.GRAY_TEXT,
157:     textAlign: 'center',
158:     fontStyle: 'italic',
159:   },
160:   inputContainer: {
161:     flexDirection: 'row',
162:     alignItems: 'center',
163:     backgroundColor: 'rgba(197, 160, 89, 0.05)',
164:     borderWidth: 1,
165:     borderColor: 'rgba(197, 160, 89, 0.3)',
166:     borderRadius: 12,
167:     paddingLeft: 16,
168:     paddingRight: 4,
169:     height: 56,
170:   },
171:   input: {
172:     flex: 1,
173:     fontFamily: F.DISPLAY,
174:     fontSize: 20,
175:     color: C.PARCHMENT,
176:     height: '100%',
177:   },
178:   searchButton: {
179:     backgroundColor: C.GOLD,
180:     borderRadius: 8,
181:     width: 40,
182:     height: 40,
183:     justifyContent: 'center',
184:     alignItems: 'center',
185:     marginLeft: 8,
186:   },
187:   searchButtonDisabled: {
188:     opacity: 0.5,
189:     backgroundColor: C.GOLD_DIM,
190:   },
191:   recentSection: {
192:     paddingHorizontal: 24,
193:     marginTop: 32,
194:   },
195:   recentTitle: {
196:     fontFamily: F.LABEL,
197:     fontSize: 12,
198:     color: C.GOLD,
199:     letterSpacing: 1,
200:     marginBottom: 16,
201:     textTransform: 'uppercase',
202:   },
203:   recentList: {
204:     gap: 8,
205:   },
206:   recentItem: {
207:     flexDirection: 'row',
208:     alignItems: 'center',
209:     backgroundColor: 'rgba(197, 160, 89, 0.03)',
210:     borderWidth: 1,
211:     borderColor: 'rgba(197, 160, 89, 0.1)',
212:     borderRadius: 8,
213:     paddingVertical: 4,
214:     paddingHorizontal: 8,
215:   },
216:   recentItemText: {
217:     flex: 1,
218:     fontFamily: F.DISPLAY,
219:     fontSize: 18,
220:     color: 'rgba(227, 220, 203, 0.8)',
221:     marginLeft: 8,
222:   },
223: });

(End of file - total 223 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/orrery/[lemma].tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/orrery/[lemma].tsx</path>
<type>file</type>
<content>
1: // ── THE DIACHRONIC ORRERY (DYNAMIC) ─────────────────────────────────────────
2: // A constellation visualization for ANY lemma's semantic neighborhood.
3: // Fully dynamic: the graph is built entirely from the API's ContrastiveProfile.
4: // No hardcoded mock data — every node comes from live data.
5: 
6: import { useLocalSearchParams, useRouter } from 'expo-router';
7: import * as Haptics from 'expo-haptics';
8: import { useEffect, useMemo, useState } from 'react';
9: import { ActivityIndicator, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
10: import Svg, { Circle, Defs, Line, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
11: import { ApiService } from '../../src/services/ApiService';
12: import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
13: import { ORRERY_PIGMENTS as P, PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
14: import type { Collocation, ContrastiveProfile, Idiom, Knot } from '../../src/types';
15: 
16: // ── Graph Types ─────────────────────────────────────────────────────────────
17: 
18: interface OrreryNode {
19:   id: string;
20:   label: string;
21:   gloss: string;
22:   type: 'center' | 'definition' | 'lsj' | 'idiom' | 'collocation' | 'ancestor';
23:   x: number;
24:   y: number;
25:   knot?: Partial<Knot>;
26: }
27: 
28: /** Split a long label into multiple lines at word boundaries (~20 chars each). */
29: function wrapLabel(text: string, maxChars = 20): string[] {
30:   // Guard: node.label can arrive as null/undefined/object from malformed API
31:   // responses. text.split is not a function on non-strings → crash.
32:   if (!text || typeof text !== 'string') return [''];
33:   if (text.length <= maxChars) return [text];
34:   const words = text.split(/\s+/);
35:   const lines: string[] = [];
36:   let current = '';
37:   for (const word of words) {
38:     if (current.length + word.length + 1 > maxChars && current.length > 0) {
39:       lines.push(current);
40:       current = word;
41:     } else {
42:       current = current ? `${current} ${word}` : word;
43:     }
44:   }
45:   if (current) lines.push(current);
46:   return lines.length > 0 ? lines : [text];
47: }
48: 
49: interface OrreryEdge {
50:   source: string;
51:   target: string;
52:   relation: 'definition' | 'idiom' | 'collocation' | 'ancestor';
53: }
54: 
55: // ── Layout Constants ────────────────────────────────────────────────────────
56: 
57: const { width: SCREEN_W } = Dimensions.get('window');
58: const GRAPH_W = Math.min(SCREEN_W - 40, 600);
59: const GRAPH_H = 560;
60: const CX = GRAPH_W / 2;
61: const CY = GRAPH_H / 2;
62: 
63: // Orbit radii — five concentric bands for five data types
64: const INNER_R   = 105;  // LSJ definitions         (Faded Cinnabar)
65: const MOD_R     = 155;  // Modern defs METIS/Kaikki (Murex Ash)
66: const MID_R     = 195;  // Collocations / ngrams    (Egyptian Frit)
67: const OUTER_R   = 235;  // Idioms / MWE             (Verdigris Chalk)
68: 
69: // ── Build Graph from API Data ───────────────────────────────────────────────
70: 
71: function buildDynamicGraph(
72:   lemma: string,
73:   profile: ContrastiveProfile,
74: ): { nodes: OrreryNode[]; edges: OrreryEdge[] } {
75:   const nodes: OrreryNode[] = [];
76:   const edges: OrreryEdge[] = [];
77: 
78:   // ── SAFE CONSTANTS — defensive extraction from ContrastiveProfile ────────
79:   const lsjDefs: string[]      = Array.isArray(profile?.lsj_definitions) ? profile.lsj_definitions.filter(Boolean) : [];
80:   const modernDefs: string[]   = Array.isArray(profile?.definitions)     ? profile.definitions.filter(Boolean)     : [];
81:   const idioms: Idiom[]        = Array.isArray(profile?.idioms)          ? profile.idioms.filter((i) => i?.expression) : [];
82:   const collocs: Collocation[] = Array.isArray(profile?.collocations)    ? profile.collocations.filter((c) => c?.text) : [];
83:   const ngrams: string[]       = Array.isArray(profile?.ngrams)          ? profile.ngrams.filter(Boolean)           : [];
84:   const ancestor: string       = profile?.ancient_ancestor ?? '';
85:   const davidNote: string      = profile?.david_note ?? '';
86:   const ragScholia: string     = profile?.rag_scholia ?? '';
87:   const kdsScore: number | undefined = profile?.kds_score;
88: 
89:   // Collocation source: prefer typed ngrams (plain strings), fall back to Collocation objects
90:   type CollocEntry = { label: string; gloss: string };
91:   const collocEntries: CollocEntry[] = ngrams.length > 0
92:     ? ngrams.slice(0, 5).map((ng) => ({ label: ng, gloss: ng }))
93:     : collocs.slice(0, 5).map((c) => ({
94:         label: c.text,
95:         gloss: `${c.text} (${(c.frequency ?? 0).toLocaleString()}×)`,
96:       }));
97: 
98:   // ── Center Star: the searched lemma (Electrum) ──────────────────────────
99:   const primaryDef = lsjDefs[0] ?? modernDefs[0] ?? davidNote.slice(0, 60) ?? '';
100:   nodes.push({
101:     id: 'center',
102:     label: lemma,
103:     gloss: primaryDef,
104:     type: 'center',
105:     x: CX,
106:     y: CY,
107:     knot: {
108:       id: 'orrery-center',
109:       text: lemma,
110:       lemma,
111:       pos: 'NOUN',
112:       definition: [...lsjDefs, ...modernDefs].join('; '),
113:       david_note: davidNote,
114:       rag_scholia: ragScholia,
115:       ancient_ancestor: ancestor || undefined,
116:       kds_score: kdsScore,
117:     },
118:   });
119: 
120:   // ── Ancestor node — top of chart (shares Electrum) ──────────────────────
121:   if (ancestor) {
122:     nodes.push({
123:       id: 'ancestor',
124:       label: ancestor,
125:       gloss: 'Ancient etymon',
126:       type: 'ancestor',
127:       x: CX,
128:       y: CY - OUTER_R,
129:       knot: {
130:         id: 'orrery-ancestor',
131:         text: ancestor,
132:         lemma,
133:         pos: 'ETYM',
134:         definition: ancestor,
135:         david_note: davidNote,
136:       },
137:     });
138:     edges.push({ source: 'center', target: 'ancestor', relation: 'ancestor' });
139:   }
140: 
141:   // ── LSJ definition nodes — inner orbit, RIGHT arc (Faded Cinnabar) ──────
142:   // Arc from upper-right to lower-right, clearing space above for ancestor.
143:   const hasAncestor = !!ancestor;
144:   const lsjCount = Math.min(lsjDefs.length, 5);
145:   const lsjStart = hasAncestor ? -Math.PI * 0.38 : -Math.PI / 2;
146:   const lsjSpan  = hasAncestor ? Math.PI * 1.0   : Math.PI * 2;
147: 
148:   for (let i = 0; i < lsjCount; i++) {
149:     const id = `lsj-${i}`;
150:     const angle = lsjStart + (i / Math.max(lsjCount - 1, 1)) * lsjSpan;
151:     const def = lsjDefs[i];
152:     nodes.push({
153:       id,
154:       label: def,
155:       gloss: def,
156:       type: 'lsj',
157:       x: CX + Math.cos(angle) * INNER_R,
158:       y: CY + Math.sin(angle) * INNER_R,
159:       knot: { id: `orrery-lsj-${i}`, text: def, lemma, pos: 'LSJ', definition: def },
160:     });
161:     edges.push({ source: 'center', target: id, relation: 'definition' });
162:   }
163: 
164:   // ── Modern definition nodes — second orbit, LEFT arc (Murex Ash) ────────
165:   // Arc from lower-left to upper-left, mirroring the LSJ arc on the other side.
166:   const modCount = Math.min(modernDefs.length, 5);
167:   const modStart = Math.PI * 0.6;   // ~108° — lower-left
168:   const modSpan  = Math.PI * 0.8;   // ~144° sweep → ends at ~252°
169: 
170:   for (let i = 0; i < modCount; i++) {
171:     const id = `mod-${i}`;
172:     const angle = modStart + (i / Math.max(modCount - 1, 1)) * modSpan;
173:     const def = modernDefs[i];
174:     nodes.push({
175:       id,
176:       label: def,
177:       gloss: def,
178:       type: 'definition',
179:       x: CX + Math.cos(angle) * MOD_R,
180:       y: CY + Math.sin(angle) * MOD_R,
181:       knot: { id: `orrery-mod-${i}`, text: def, lemma, pos: 'MOD', definition: def },
182:     });
183:     edges.push({ source: 'center', target: id, relation: 'definition' });
184:   }
185: 
186:   // ── Collocation / ngram nodes — mid orbit, bottom arc (Egyptian Frit) ───
187:   // Bottom arc keeps them spatially distinct from the definition arcs above.
188:   const colCount = collocEntries.length;
189:   const colStart = Math.PI * 0.45;   // ~81° (right-bottom)
190:   const colSpan  = Math.PI * 1.1;    // ~198° sweep → ends at ~279°
191: 
192:   for (let i = 0; i < colCount; i++) {
193:     const id = `colloc-${i}`;
194:     const angle = colStart + (i / Math.max(colCount, 1)) * colSpan;
195:     const entry = collocEntries[i];
196:     nodes.push({
197:       id,
198:       label: entry.label,
199:       gloss: entry.gloss,
200:       type: 'collocation',
201:       x: CX + Math.cos(angle) * MID_R,
202:       y: CY + Math.sin(angle) * MID_R,
203:       knot: {
204:         id: `orrery-colloc-${i}`,
205:         text: entry.label,
206:         lemma,
207:         pos: 'HNC',
208:         definition: entry.gloss,
209:       },
210:     });
211:     edges.push({ source: 'center', target: id, relation: 'collocation' });
212:   }
213: 
214:   // ── Idiom nodes — outer orbit, upper arc (Verdigris Chalk) ──────────────
215:   // Spread across the top portion, flanking the ancestor node.
216:   const idiomCount = Math.min(idioms.length, 5);
217:   const idiomStart = -Math.PI * 0.38;  // -68° (upper-right)
218:   const idiomSpan  =  Math.PI * 0.76;  // 137° sweep → ends at +68° (upper-left)
219: 
220:   for (let i = 0; i < idiomCount; i++) {
221:     const id = `idiom-${i}`;
222:     const angle = idiomStart + (i / Math.max(idiomCount, 1)) * idiomSpan;
223:     const idiom = idioms[i];
224:     const expr = idiom.expression || '';
225:     const trans = idiom.translation || '';
226:     nodes.push({
227:       id,
228:       label: expr,
229:       gloss: trans,
230:       type: 'idiom',
231:       x: CX + Math.cos(angle) * OUTER_R,
232:       y: CY + Math.sin(angle) * OUTER_R,
233:       knot: {
234:         id: `orrery-idiom-${i}`,
235:         text: expr,
236:         lemma,
237:         pos: 'MWE',
238:         definition: trans,
239:         david_note: `Idiom: ${expr}`,
240:         rag_scholia: idiom.source || 'METIS idiom registry',
241:       },
242:     });
243:     edges.push({ source: 'center', target: id, relation: 'idiom' });
244:   }
245: 
246:   return { nodes, edges };
247: }
248: 
249: // ── Edge Colors ─────────────────────────────────────────────────────────────
250: 
251: // Warm parchment-tinted filaments — subtle antiquity feel on the dark void
252: const EDGE_COLOR   = 'rgba(223, 206, 159, 0.18)';
253: const EDGE_STROKE_W = 1.5;
254: 
255: // ── Node Colors — Faded Antiquity Pigments ───────────────────────────────────
256: // All pigments are light pastels on the dark void. Text is always dark ink.
257: const NODE_CONFIG: Record<OrreryNode['type'], { fill: string; text: string; stroke: string; r: number; glow: string }> = {
258:   center:      { fill: P.ELECTRUM,        text: '#111413', stroke: 'rgba(223, 206, 159, 0.55)', r: 46, glow: 'rgba(223, 206, 159, 0.22)' },
259:   lsj:         { fill: P.FADED_CINNABAR,  text: '#111413', stroke: 'rgba(213, 160, 150, 0.55)', r: 30, glow: 'rgba(213, 160, 150, 0.20)' },
260:   definition:  { fill: P.MUREX_ASH,       text: '#111413', stroke: 'rgba(181, 163, 196, 0.55)', r: 30, glow: 'rgba(181, 163, 196, 0.20)' },
261:   ancestor:    { fill: P.ELECTRUM,        text: '#111413', stroke: 'rgba(223, 206, 159, 0.45)', r: 34, glow: 'rgba(223, 206, 159, 0.16)' },
262:   collocation: { fill: P.EGYPTIAN_FRIT,   text: '#111413', stroke: 'rgba(147, 168, 186, 0.55)', r: 26, glow: 'rgba(147, 168, 186, 0.18)' },
263:   idiom:       { fill: P.VERDIGRIS_CHALK, text: '#111413', stroke: 'rgba(161, 184, 160, 0.55)', r: 32, glow: 'rgba(161, 184, 160, 0.20)' },
264: };
265: 
266: // ── Main Component ──────────────────────────────────────────────────────────
267: 
268: export default function OrreryScreen() {
269:   const { lemma: rawLemma } = useLocalSearchParams<{ lemma: string }>();
270:   const lemma = decodeURIComponent(rawLemma || '');
271:   const router = useRouter();
272:   const openInspector = useInspectorStore((s) => s.openInspector);
273:   const [selectedId, setSelectedId] = useState<string | null>(null);
274:   const [profile, setProfile] = useState<ContrastiveProfile | null>(null);
275:   const [apiLoading, setApiLoading] = useState(true);
276: 
277:   // Fetch the ContrastiveProfile for this lemma
278:   useEffect(() => {
279:     // Guard: Expo Router passes the literal "[lemma]" during the initial
280:     // unresolved render cycle. Firing inspectLemma with that string causes a 404.
281:     if (!lemma || lemma === '[lemma]') return;
282:     let cancelled = false;
283:     setApiLoading(true);
284:     setProfile(null);
285:     setSelectedId(null);
286:     (async () => {
287:       try {
288:         const data = await ApiService.inspectLemma(lemma);
289:         if (!cancelled && data) setProfile(data);
290:       } catch (e) {
291:         console.warn('[Orrery] API unreachable for', lemma);
292:       } finally {
293:         if (!cancelled) setApiLoading(false);
294:       }
295:     })();
296:     return () => { cancelled = true; };
297:   }, [lemma]);
298: 
299:   // Build dynamic graph from API data
300:   const { nodes, edges } = useMemo(() => {
301:     if (!profile) return { nodes: [], edges: [] };
302:     return buildDynamicGraph(lemma, profile);
303:   }, [profile, lemma]);
304: 
305:   const nodeMap = useMemo(() => {
306:     const map: Record<string, OrreryNode> = {};
307:     nodes.forEach((n) => { map[n.id] = n; });
308:     return map;
309:   }, [nodes]);
310: 
311:   const selectedNode = selectedId ? nodeMap[selectedId] : null;
312: 
313:   const handleNodePress = (node: OrreryNode) => {
314:     if (Platform.OS !== 'web') {
315:       Haptics.selectionAsync();
316:     }
317:     setSelectedId(node.id === selectedId ? null : node.id);
318:   };
319: 
320:   const handleInspect = (node: OrreryNode) => {
321:     if (!node.knot) return;
322:     if (Platform.OS !== 'web') {
323:       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
324:     }
325:     openInspector(node.knot as any, 'knot');
326:   };
327: 
328:   // ── Legend — Faded Antiquity Pigments ─────────────────────────────────
329:   const legendItems = [
330:     { color: P.ELECTRUM,        label: 'Center' },
331:     { color: P.FADED_CINNABAR,  label: 'LSJ / Ancient' },
332:     { color: P.MUREX_ASH,       label: 'Modern · Kaikki' },
333:     { color: P.VERDIGRIS_CHALK, label: 'Idiom / MWE' },
334:     { color: P.EGYPTIAN_FRIT,   label: 'Collocation · HNC' },
335:   ];
336: 
337:   // ── Loading State ─────────────────────────────────────────────────────
338:   if (apiLoading) {
339:     return (
340:       <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
341:         <ActivityIndicator size="large" color={C.GOLD} />
342:         <Text style={styles.loadingText}>
343:           Charting the constellation for {lemma}...
344:         </Text>
345:       </View>
346:     );
347:   }
348: 
349:   // ── Philological Void: API returned nothing ───────────────────────────
350:   if (!profile) {
351:     return (
352:       <View style={[styles.root, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
353:         <Pressable
354:           onPress={() => router.back()}
355:           style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed, { position: 'absolute', top: 48, left: 16 }]}
356:           hitSlop={12}
357:         >
358:           <Text style={styles.backIcon}>{'\u2039'}</Text>
359:         </Pressable>
360:         <Text style={{ fontFamily: F.DISPLAY, fontSize: 24, color: C.GOLD, marginBottom: 8 }}>
361:           Philological Void
362:         </Text>
363:         <Text style={{ fontFamily: F.BODY, fontSize: 14, color: C.GRAY_TEXT, textAlign: 'center', lineHeight: 22 }}>
364:           The diachronic link for "{lemma}" is lost to time.{'\n'}
365:           No constellation data could be retrieved.
366:         </Text>
367:         <Pressable
368:           style={({ pressed }) => [styles.searchAgainButton, pressed && styles.searchAgainButtonPressed]}
369:           onPress={() => router.replace('/orrery' as any)}
370:         >
371:           <Text style={styles.searchAgainText}>Search Again</Text>
372:         </Pressable>
373:       </View>
374:     );
375:   }
376: 
377:   return (
378:     <View style={styles.root}>
379:       {/* ── Back + Title ──────────────────────────────────────────────── */}
380:       <View style={styles.hudTop}>
381:         <Pressable
382:           onPress={() => router.back()}
383:           style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
384:           hitSlop={12}
385:         >
386:           <Text style={styles.backIcon}>{'\u2039'}</Text>
387:         </Pressable>
388:         <View style={styles.titleBlock}>
389:           <Text style={styles.eyebrow}>DIACHRONIC ORRERY</Text>
390:           <View style={styles.titleRow}>
391:             <Text style={styles.titleText}>{lemma}</Text>
392:             <View style={styles.liveIndicator}>
393:               <View style={styles.liveDot} />
394:               <Text style={styles.liveText}>LIVE</Text>
395:             </View>
396:           </View>
397:         </View>
398:       </View>
399: 
400:       <ScrollView
401:         contentContainerStyle={styles.scrollContent}
402:         showsVerticalScrollIndicator={false}
403:       >
404:         {/* ── The Constellation SVG ──────────────────────────────────── */}
405:         <View style={styles.graphContainer}>
406:           <Svg width={GRAPH_W} height={GRAPH_H}>
407:             <Defs>
408:               {nodes.map((node) => {
409:                 const cfg = NODE_CONFIG[node.type];
410:                 return (
411:                   <RadialGradient key={`glow-${node.id}`} id={`glow-${node.id}`} cx="50%" cy="50%" r="50%">
412:                     <Stop offset="0%" stopColor={cfg.glow} stopOpacity="1" />
413:                     <Stop offset="100%" stopColor={cfg.glow} stopOpacity="0" />
414:                   </RadialGradient>
415:                 );
416:               })}
417:             </Defs>
418: 
419:             {/* Edges */}
420:             {edges.map((edge, i) => {
421:               const src = nodeMap[edge.source];
422:               const tgt = nodeMap[edge.target];
423:               if (!src || !tgt) return null;
424:               return (
425:                 <Line
426:                   key={`edge-${i}`}
427:                   x1={src.x}
428:                   y1={src.y}
429:                   x2={tgt.x}
430:                   y2={tgt.y}
431:                   stroke={EDGE_COLOR}
432:                   strokeWidth={EDGE_STROKE_W}
433:                   strokeLinecap="round"
434:                 />
435:               );
436:             })}
437: 
438:             {/* Node Glow Halos */}
439:             {nodes.map((node) => {
440:               const cfg = NODE_CONFIG[node.type];
441:               const isSelected = node.id === selectedId;
442:               return (
443:                 <Circle
444:                   key={`halo-${node.id}`}
445:                   cx={node.x}
446:                   cy={node.y}
447:                   r={cfg.r + 14}
448:                   fill={`url(#glow-${node.id})`}
449:                   opacity={isSelected ? 0.8 : 0.4}
450:                 />
451:               );
452:             })}
453: 
454:             {/* Nodes — solid jewel-tone circles */}
455:             {nodes.map((node) => {
456:               const cfg = NODE_CONFIG[node.type];
457:               const isSelected = node.id === selectedId;
458:               return (
459:                 <Circle
460:                   key={node.id}
461:                   cx={node.x}
462:                   cy={node.y}
463:                   r={isSelected ? cfg.r + 3 : cfg.r}
464:                   fill={cfg.fill}
465:                   stroke={isSelected ? C.PARCHMENT : cfg.stroke}
466:                   strokeWidth={isSelected ? 2.5 : 1.5}
467:                   fillOpacity={1}
468:                   onPress={() => handleNodePress(node)}
469:                 />
470:               );
471:             })}
472: 
473:             {/* Node Labels — outside nodes, word-wrapped, no truncation */}
474:             {nodes.map((node) => {
475:               const cfg = NODE_CONFIG[node.type];
476:               const lines = wrapLabel(node.label, 20);
477:               return lines.map((line, li) => (
478:                 <SvgText
479:                   key={`${node.id}-label-${li}`}
480:                   x={node.x}
481:                   y={node.y + cfg.r + 15 + li * 14}
482:                   textAnchor="middle"
483:                   fill={C.PARCHMENT}
484:                   fontSize={11}
485:                   fontWeight={node.type === 'center' ? 'bold' : 'normal'}
486:                   fontFamily={F.DISPLAY}
487:                   onPress={() => handleNodePress(node)}
488:                 >
489:                   {line}
490:                 </SvgText>
491:               ));
492:             })}
493:           </Svg>
494:         </View>
495: 
496:         {/* ── Legend ──────────────────────────────────────────────────── */}
497:         <View style={styles.legend}>
498:           {legendItems.map((item) => (
499:             <View key={item.label} style={styles.legendItem}>
500:               <View style={[styles.legendDot, { backgroundColor: item.color }]} />
501:               <Text style={styles.legendLabel}>{item.label}</Text>
502:             </View>
503:           ))}
504:         </View>
505: 
506:         {/* ── Evidence Panel ─────────────────────────────────────────── */}
507:         {selectedNode ? (
508:           <View style={styles.evidencePanel}>
509:             <View style={styles.evidenceHeader}>
510:               <Text style={styles.evidenceWord}>{String(selectedNode?.label || "").replace('\n', ' ')}</Text>
511:             </View>
512: 
513:             <Text style={styles.evidenceGloss}>{selectedNode.gloss}</Text>
514: 
515:             {/* Type badge */}
516:             <View style={styles.typeBadgeRow}>
517:               <View style={[styles.typeBadge, { borderColor: NODE_CONFIG[selectedNode.type].stroke }]}>
518:                 <Text style={[styles.typeBadgeText, { color: NODE_CONFIG[selectedNode.type].stroke }]}>
519:                   {selectedNode.type.toUpperCase()}
520:                 </Text>
521:               </View>
522:               {selectedNode.knot?.pos && (
523:                 <View style={styles.posBadge}>
524:                   <Text style={styles.posBadgeText}>{selectedNode.knot.pos}</Text>
525:                 </View>
526:               )}
527:             </View>
528: 
529:             {/* Davidian Note (center node only) */}
530:             {selectedNode.knot?.david_note && selectedNode.id === 'center' ? (
531:               <View style={styles.noteExcerpt}>
532:                 <Text style={styles.noteExcerptLabel}>Diachronic Note</Text>
533:                 <Text style={styles.noteExcerptBody}>{selectedNode.knot.david_note}</Text>
534:               </View>
535:             ) : null}
536: 
537:             {/* Grammar Scholia (center node only) */}
538:             {profile.grammar_scholia && selectedNode.id === 'center' ? (
539:               <View style={styles.noteExcerpt}>
540:                 <Text style={styles.noteExcerptLabel}>Grammar Scholia</Text>
541:                 <Text style={styles.noteExcerptBody}>{profile.grammar_scholia}</Text>
542:               </View>
543:             ) : null}
544: 
545:             {/* KDS Score (center node only) */}
546:             {selectedNode.id === 'center' && profile.kds_score != null ? (
547:               <View style={styles.kdsRow}>
548:                 <Text style={styles.kdsLabel}>KDS Score</Text>
549:                 <Text style={styles.kdsValue}>{profile.kds_score.toFixed(2)}</Text>
550:               </View>
551:             ) : null}
552: 
553:             {/* HNC Collocations (center node) */}
554:             {selectedNode.id === 'center' && (profile.collocations?.length || 0) > 0 ? (
555:               <View style={styles.collocationsRow}>
556:                 <Text style={styles.noteExcerptLabel}>HNC Collocations</Text>
557:                 <View style={styles.collocChips}>
558:                   {(profile.collocations ?? []).slice(0, 6).map((c, i) => (
559:                     <View key={i} style={styles.collocChip}>
560:                       <Text style={styles.collocChipText}>{c.text}</Text>
561:                       <Text style={styles.collocChipFreq}>{c.frequency.toLocaleString()}×</Text>
562:                     </View>
563:                   ))}
564:                 </View>
565:               </View>
566:             ) : null}
567: 
568:             {/* Inspect button */}
569:             <Pressable
570:               style={({ pressed }) => [styles.inspectButton, pressed && styles.inspectButtonPressed]}
571:               onPress={() => handleInspect(selectedNode)}
572:             >
573:               <Text style={styles.inspectButtonText}>Open in Inspector</Text>
574:             </Pressable>
575:           </View>
576:         ) : (
577:           <View style={styles.hintPanel}>
578:             <Text style={styles.hintText}>
579:               Tap a node to reveal its evidence stack
580:             </Text>
581:           </View>
582:         )}
583: 
584:         {/* ── Search Again shortcut ──────────────────────────────────── */}
585:         <View style={styles.searchAgainRow}>
586:           <Pressable
587:             style={({ pressed }) => [styles.searchAgainButton, pressed && styles.searchAgainButtonPressed]}
588:             onPress={() => router.replace('/orrery' as any)}
589:           >
590:             <Text style={styles.searchAgainText}>Search Another Lemma</Text>
591:           </Pressable>
592:         </View>
593:       </ScrollView>
594:     </View>
595:   );
596: }
597: 
598: // ── Styles ───────────────────────────────────────────────────────────────────
599: 
600: const styles = StyleSheet.create({
601:   root: {
602:     flex: 1,
603:     backgroundColor: 'transparent',
604:   },
605: 
606:   // ── Loading ─────────────────────────────────────────────────────────────
607:   loadingText: {
608:     fontFamily: F.BODY,
609:     fontSize: 13,
610:     color: C.GRAY_TEXT,
611:     marginTop: 16,
612:     fontStyle: 'italic',
613:   },
614: 
615:   // ── HUD ──────────────────────────────────────────────────────────────────
616:   hudTop: {
617:     flexDirection: 'row',
618:     alignItems: 'center',
619:     paddingTop: 52,
620:     paddingHorizontal: 20,
621:     paddingBottom: 12,
622:     gap: 14,
623:   },
624:   backButton: {
625:     width: 44,
626:     height: 44,
627:     borderRadius: 22,
628:     backgroundColor: 'rgba(10, 15, 13, 0.7)',
629:     borderWidth: 1,
630:     borderColor: 'rgba(197, 160, 89, 0.35)',
631:     alignItems: 'center',
632:     justifyContent: 'center',
633:   },
634:   backButtonPressed: {
635:     backgroundColor: 'rgba(197, 160, 89, 0.15)',
636:     borderColor: C.GOLD,
637:   },
638:   backIcon: {
639:     color: C.GOLD,
640:     fontSize: 28,
641:     lineHeight: 32,
642:     fontWeight: '300',
643:     marginLeft: -2,
644:   },
645:   titleBlock: {
646:     flex: 1,
647:   },
648:   titleRow: {
649:     flexDirection: 'row',
650:     alignItems: 'center',
651:   },
652:   liveIndicator: {
653:     flexDirection: 'row',
654:     alignItems: 'center',
655:     gap: 4,
656:     marginLeft: 10,
657:     backgroundColor: 'rgba(52, 211, 153, 0.1)',
658:     borderRadius: 8,
659:     paddingHorizontal: 8,
660:     paddingVertical: 2,
661:   },
662:   liveDot: {
663:     width: 6,
664:     height: 6,
665:     borderRadius: 3,
666:     backgroundColor: '#34D399',
667:   },
668:   liveText: {
669:     fontFamily: F.LABEL,
670:     fontSize: 8,
671:     fontWeight: 'bold',
672:     color: '#34D399',
673:     letterSpacing: 1,
674:   },
675:   eyebrow: {
676:     fontFamily: F.LABEL,
677:     fontSize: 9,
678:     fontWeight: 'bold',
679:     letterSpacing: 3,
680:     color: C.GOLD,
681:     textTransform: 'uppercase',
682:   },
683:   titleText: {
684:     fontFamily: F.DISPLAY,
685:     fontSize: 24,
686:     color: C.PARCHMENT,
687:     marginTop: 2,
688:   },
689: 
690:   scrollContent: {
691:     paddingBottom: 60,
692:   },
693: 
694:   // ── Graph ────────────────────────────────────────────────────────────────
695:   graphContainer: {
696:     alignItems: 'center',
697:     marginTop: 8,
698:     marginHorizontal: 20,
699:     borderWidth: 1,
700:     borderColor: 'rgba(255, 255, 255, 0.06)',
701:     borderRadius: 16,
702:     backgroundColor: 'transparent',
703:     overflow: 'hidden',
704:   },
705: 
706:   // ── Legend ────────────────────────────────────────────────────────────────
707:   legend: {
708:     flexDirection: 'row',
709:     flexWrap: 'wrap',
710:     justifyContent: 'center',
711:     gap: 16,
712:     paddingHorizontal: 20,
713:     paddingVertical: 12,
714:   },
715:   legendItem: {
716:     flexDirection: 'row',
717:     alignItems: 'center',
718:     gap: 6,
719:   },
720:   legendDot: {
721:     width: 10,
722:     height: 10,
723:     borderRadius: 5,
724:   },
725:   legendLabel: {
726:     fontFamily: F.LABEL,
727:     fontSize: 9,
728:     color: C.GRAY_TEXT,
729:     letterSpacing: 0.5,
730:   },
731: 
732:   // ── Evidence Panel ───────────────────────────────────────────────────────
733:   evidencePanel: {
734:     marginHorizontal: 20,
735:     backgroundColor: C.SURFACE_HEAVY,
736:     borderWidth: 1,
737:     borderColor: C.GOLD_DIM,
738:     borderRadius: 16,
739:     padding: 20,
740:     gap: 12,
741:   },
742:   evidenceHeader: {
743:     flexDirection: 'row',
744:     alignItems: 'center',
745:     justifyContent: 'space-between',
746:   },
747:   evidenceWord: {
748:     fontFamily: F.DISPLAY,
749:     fontSize: 24,
750:     color: C.PARCHMENT,
751:     flex: 1,
752:   },
753:   evidenceGloss: {
754:     fontFamily: F.BODY,
755:     fontSize: 14,
756:     color: C.GRAY_TEXT,
757:     fontStyle: 'italic',
758:   },
759:   typeBadgeRow: {
760:     flexDirection: 'row',
761:     gap: 8,
762:   },
763:   typeBadge: {
764:     borderWidth: 1,
765:     borderRadius: 6,
766:     paddingHorizontal: 8,
767:     paddingVertical: 3,
768:   },
769:   typeBadgeText: {
770:     fontFamily: F.LABEL,
771:     fontSize: 9,
772:     fontWeight: 'bold',
773:     letterSpacing: 1,
774:     textTransform: 'uppercase',
775:   },
776:   posBadge: {
777:     backgroundColor: 'rgba(55, 65, 81, 0.4)',
778:     borderWidth: 1,
779:     borderColor: 'rgba(55, 65, 81, 0.8)',
780:     borderRadius: 6,
781:     paddingHorizontal: 8,
782:     paddingVertical: 3,
783:   },
784:   posBadgeText: {
785:     fontFamily: F.LABEL,
786:     fontSize: 9,
787:     fontWeight: 'bold',
788:     color: C.GRAY_TEXT,
789:     letterSpacing: 1,
790:     textTransform: 'uppercase',
791:   },
792:   noteExcerpt: {
793:     backgroundColor: 'rgba(10, 15, 13, 0.4)',
794:     borderWidth: 1,
795:     borderColor: 'rgba(255, 255, 255, 0.06)',
796:     borderRadius: 10,
797:     padding: 16,
798:   },
799:   noteExcerptLabel: {
800:     fontFamily: F.LABEL,
801:     fontSize: 9,
802:     fontWeight: 'bold',
803:     textTransform: 'uppercase',
804:     letterSpacing: 1.5,
805:     color: C.GOLD,
806:     marginBottom: 8,
807:   },
808:   noteExcerptBody: {
809:     fontFamily: F.BODY,
810:     fontSize: 13,
811:     color: C.PARCHMENT,
812:     lineHeight: 20,
813:   },
814:   kdsRow: {
815:     flexDirection: 'row',
816:     justifyContent: 'space-between',
817:     alignItems: 'center',
818:     paddingHorizontal: 14,
819:     paddingVertical: 8,
820:     backgroundColor: 'rgba(197, 160, 89, 0.06)',
821:     borderRadius: 8,
822:     borderWidth: 1,
823:     borderColor: 'rgba(197, 160, 89, 0.15)',
824:   },
825:   kdsLabel: {
826:     fontFamily: F.LABEL,
827:     fontSize: 9,
828:     fontWeight: 'bold',
829:     color: C.GOLD,
830:     letterSpacing: 1.5,
831:     textTransform: 'uppercase',
832:   },
833:   kdsValue: {
834:     fontFamily: F.DISPLAY,
835:     fontSize: 18,
836:     color: C.GOLD,
837:     fontWeight: 'bold',
838:   },
839:   collocationsRow: {
840:     gap: 8,
841:   },
842:   collocChips: {
843:     flexDirection: 'row',
844:     flexWrap: 'wrap',
845:     gap: 6,
846:   },
847:   collocChip: {
848:     flexDirection: 'row',
849:     alignItems: 'center',
850:     gap: 4,
851:     backgroundColor: 'rgba(15, 5, 24, 0.4)',
852:     borderWidth: 1,
853:     borderColor: C.GRAY_BORDER,
854:     borderRadius: 6,
855:     paddingHorizontal: 8,
856:     paddingVertical: 4,
857:   },
858:   collocChipText: {
859:     fontFamily: F.BODY,
860:     fontSize: 11,
861:     color: C.PARCHMENT,
862:   },
863:   collocChipFreq: {
864:     fontFamily: F.LABEL,
865:     fontSize: 9,
866:     color: C.GRAY_TEXT,
867:   },
868:   inspectButton: {
869:     backgroundColor: C.GOLD_DIM,
870:     borderWidth: 1,
871:     borderColor: 'rgba(197, 160, 89, 0.3)',
872:     borderRadius: 10,
873:     paddingVertical: 12,
874:     alignItems: 'center',
875:   },
876:   inspectButtonPressed: {
877:     backgroundColor: 'rgba(197, 160, 89, 0.25)',
878:     borderColor: C.GOLD,
879:   },
880:   inspectButtonText: {
881:     fontFamily: F.LABEL,
882:     fontSize: 11,
883:     fontWeight: 'bold',
884:     color: C.GOLD,
885:     letterSpacing: 1.5,
886:     textTransform: 'uppercase',
887:   },
888: 
889:   // ── Hint Panel ───────────────────────────────────────────────────────────
890:   hintPanel: {
891:     marginHorizontal: 20,
892:     alignItems: 'center',
893:     paddingVertical: 24,
894:   },
895:   hintText: {
896:     fontFamily: F.LABEL,
897:     fontSize: 11,
898:     color: 'rgba(156, 163, 175, 0.5)',
899:     letterSpacing: 0.5,
900:     fontStyle: 'italic',
901:   },
902: 
903:   // ── Search Again ─────────────────────────────────────────────────────────
904:   searchAgainRow: {
905:     alignItems: 'center',
906:     marginTop: 20,
907:     paddingHorizontal: 20,
908:   },
909:   searchAgainButton: {
910:     backgroundColor: 'rgba(10, 15, 13, 0.5)',
911:     borderWidth: 1,
912:     borderColor: C.GRAY_BORDER,
913:     borderRadius: 10,
914:     paddingVertical: 12,
915:     paddingHorizontal: 24,
916:     marginTop: 16,
917:   },
918:   searchAgainButtonPressed: {
919:     backgroundColor: C.GOLD_DIM,
920:     borderColor: C.GOLD,
921:   },
922:   searchAgainText: {
923:     fontFamily: F.LABEL,
924:     fontSize: 11,
925:     fontWeight: 'bold',
926:     color: C.GRAY_TEXT,
927:     letterSpacing: 1,
928:     textTransform: 'uppercase',
929:   },
930: });

(End of file - total 930 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/lapidary/[sentenceId].tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/lapidary/[sentenceId].tsx</path>
<type>file</type>
<content>
1: // ── THE LAPIDARY'S TABLE ──────────────────────────────────────────────────────
2: // Active quiz mode. Duolingo-style Lexical Array with inline dashed blank box.
3: // The user selects the correct inflected form from 5 shuffled paradigm options.
4: //
5: // Flow: SentenceCard (blank inline) → Quiz Options (selection) → Feedback
6: // Success: flash green, fill word, mark 'practiced', return to Voyage.
7: // Failure: flash red, shake, allow retry.
8: 
9: import { useLocalSearchParams, useRouter } from 'expo-router';
10: import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
11: import {
12:   Animated,
13:   Pressable,
14:   ScrollView,
15:   StyleSheet,
16:   Text,
17:   TouchableOpacity,
18:   View,
19: } from 'react-native';
20: import { IconButton } from 'react-native-paper';
21: import { SafeAreaView } from 'react-native-safe-area-context';
22: import { getSentenceCount, useVoyageStore } from '../../src/store/voyageStore';
23: import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
24: import type { Knot, VoyageSentence } from '../../src/types';
25: 
26: // ── Helpers ──────────────────────────────────────────────────────────────────
27: 
28: /**
29:  * Extract a form string from a paradigm entry.
30:  * Handles: plain string, { form }, { word }, { text }, or any object with a string value.
31:  */
32: function extractForm(entry: any): string {
33:   if (!entry) return '';
34:   if (typeof entry === 'string') return entry.trim();
35:   if (typeof entry === 'object') {
36:     const raw = entry.form ?? entry.word ?? entry.text ?? entry.surface_form ?? '';
37:     return String(raw).trim();
38:   }
39:   return String(entry).trim();
40: }
41: 
42: /** A knot is "real" if it has a non-empty text that isn't the mapper fallback. */
43: function isRealKnot(k: Knot): boolean {
44:   return !!k.text && k.text.trim().length > 0 && k.text !== 'UNKNOWN';
45: }
46: 
47: /** Check if a paradigm array has the correct form + at least 1 distractor. */
48: function hasUsableParadigm(paradigm: any[] | undefined): boolean {
49:   if (!Array.isArray(paradigm) || paradigm.length < 2) return false;
50:   const usable = paradigm.filter((p) => extractForm(p).length > 0);
51:   return usable.length >= 2;
52: }
53: 
54: /**
55:  * Pick the best knot to challenge. Priority:
56:  *   1. has_paradigm === true  AND paradigm.length > 0  AND real text
57:  *   2. paradigm array exists with length > 0           AND real text
58:  *   3. any paradigm data at all (even 1 entry)         AND real text
59:  *   4. any real knot (so the blank at least renders)
60:  * NEVER returns a knot whose text is 'UNKNOWN'.
61:  */
62: function pickChallengeKnot(sentence: VoyageSentence): Knot | null {
63:   const real = sentence.knots.filter(isRealKnot);
64:   if (real.length === 0) return null;
65: 
66:   // Tier 1: flagged + usable paradigm (correct + distractors)
67:   const tier1 = real.find(
68:     (k) => k.has_paradigm === true && hasUsableParadigm(k.paradigm),
69:   );
70:   if (tier1) return tier1;
71: 
72:   // Tier 2: usable paradigm even without the flag
73:   const tier2 = real.find((k) => hasUsableParadigm(k.paradigm));
74:   if (tier2) return tier2;
75: 
76:   // Tier 3: any paradigm array with at least 1 entry
77:   const tier3 = real.find(
78:     (k) => Array.isArray(k.paradigm) && k.paradigm.length > 0,
79:   );
80:   if (tier3) return tier3;
81: 
82:   // Tier 4: first real knot (blank renders, but no quiz options)
83:   return real[0];
84: }
85: 
86: // ── Lexical Array: find matching knot for a word chunk ──────────────────────
87: 
88: function findKnot(chunk: string, knots: Knot[]): Knot | undefined {
89:   if (!knots || knots.length === 0) return undefined;
90:   const clean = chunk.replace(/[.,;:!?]/g, '').toLowerCase();
91:   if (!clean) return undefined;
92:   return knots.find(
93:     (k) => k.text.toLowerCase() === clean || k.lemma.toLowerCase() === clean,
94:   );
95: }
96: 
97: type FeedbackState = 'idle' | 'correct' | 'incorrect';
98: 
99: // ── Main Screen ──────────────────────────────────────────────────────────────
100: 
101: export default function LapidaryScreen() {
102:   const { sentenceId } = useLocalSearchParams<{ sentenceId: string }>();
103:   const router = useRouter();
104:   const { manifest, markPracticed } = useVoyageStore();
105: 
106:   // Guard: Expo Router passes the literal "[sentenceId]" during the initial
107:   // unresolved render cycle. Treat it as missing — show the void state.
108:   const resolvedId = (!sentenceId || sentenceId === '[sentenceId]') ? undefined : sentenceId;
109: 
110:   // Find the sentence in the current voyage + derive navigation
111:   const sentence = useMemo(
112:     () => resolvedId ? (manifest?.sentences.find((s) => s.id === resolvedId) ?? null) : null,
113:     [manifest, resolvedId],
114:   );
115: 
116:   const total = getSentenceCount(manifest);
117:   const sentenceIndex = useMemo(
118:     () => resolvedId ? (manifest?.sentences.findIndex((s) => s.id === resolvedId) ?? -1) : -1,
119:     [manifest, resolvedId],
120:   );
121:   const prevSentence = sentenceIndex > 0 ? manifest?.sentences[sentenceIndex - 1] : null;
122:   const nextSentence = sentenceIndex >= 0 && sentenceIndex < total - 1
123:     ? manifest?.sentences[sentenceIndex + 1]
124:     : null;
125: 
126:   const challengeKnot = useMemo(
127:     () => (sentence ? pickChallengeKnot(sentence) : null),
128:     [sentence],
129:   );
130: 
131:   const correctForm = challengeKnot?.text ?? '';
132: 
133:   // ── Lexical Array: split sentence into chunks preserving delimiters ─────
134:   const chunks = useMemo(
135:     () => (sentence ? sentence.greek_text.split(/([\s.,;:!?]+)/g).filter(Boolean) : []),
136:     [sentence],
137:   );
138: 
139:   // ── State ──────────────────────────────────────────────────────────────
140:   const [feedback, setFeedback] = useState<FeedbackState>('idle');
141:   const [selectedForm, setSelectedForm] = useState<string | null>(null);
142:   const [attempts, setAttempts] = useState(0);
143:   const [quizOptions, setQuizOptions] = useState<string[]>([]);
144:   const shakeAnim = useRef(new Animated.Value(0)).current;
145: 
146:   // ── Build quiz options: 1 correct + up to 4 unique incorrect from paradigm ──
147:   useEffect(() => {
148:     if (!challengeKnot?.paradigm || challengeKnot.paradigm.length === 0 || !correctForm) {
149:       setQuizOptions([]);
150:       return;
151:     }
152: 
153:     const correct = correctForm.trim().toLowerCase();
154: 
155:     // Prefer challengeKnot.tag (split on '|' and filter '_') as the primary canonical tag source.
156:     // If tag is missing or empty, fall back to morphology.
157:     const tagsSource = challengeKnot.tag && challengeKnot.tag.split('|').filter(t => t !== '_').length > 0
158:       ? challengeKnot.tag.split('|').filter(t => t !== '_')
159:       : (challengeKnot.morphology && challengeKnot.morphology.length > 0 ? challengeKnot.morphology : []);
160: 
161:     // Normalize to lowercase and trim for meaningful comparisons
162:     const targetTags = new Set(tagsSource.map(t => String(t).toLowerCase().trim()));
163: 
164:     const seen = new Set<string>();
165:     const incorrectForms: { form: string; score: number }[] = [];
166: 
167:     // Score each paradigm entry by morphological similarity (intersection over tags)
168:     for (const p of challengeKnot.paradigm) {
169:       const form = extractForm(p);
170:       if (!form) continue;
171: 
172:       const normalized = form.toLowerCase();
173:       if (normalized === correct || seen.has(normalized)) continue;
174: 
175:       seen.add(normalized);
176: 
177:       let score = 0;
178:       if (p.tags && Array.isArray(p.tags)) {
179:         // Normalize p.tags the same way: lowercase and trim
180:         const pTags = p.tags.map((t: string) => String(t).toLowerCase().trim());
181:         for (const t of pTags) {
182:           if (targetTags.has(t)) {
183:             score += 1;
184:           }
185:         }
186:       }
187: 
188:       // Add small random noise to break ties among equally similar distractors
189:       score += Math.random() * 0.1;
190:       incorrectForms.push({ form, score });
191:     }
192: 
193:     // Sort descending by score to get high intersection but different forms
194:     incorrectForms.sort((a, b) => b.score - a.score);
195: 
196:     // Pick top distractors
197:     const picked = incorrectForms.slice(0, 4).map(item => item.form);
198: 
199:     // We already sorted all `incorrectForms` by their score in descending order,
200:     // and picked the top 4. If we have less than 4 `incorrectForms` in total,
201:     // `picked` will naturally be smaller, and we use whatever is available.
202: 
203:     // Combine with correct form and shuffle all 5
204:     const options = [...picked, correctForm].sort(() => Math.random() - 0.5);
205:     setQuizOptions(options);
206:   }, [challengeKnot, correctForm]);
207: 
208:   // ── Shake animation for incorrect answer ──────────────────────────────
209:   const triggerShake = useCallback(() => {
210:     Animated.sequence([
211:       Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
212:       Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
213:       Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
214:       Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
215:       Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
216:     ]).start();
217:   }, [shakeAnim]);
218: 
219:   // ── Quiz option press handler ─────────────────────────────────────────
220:   const handleCellPress = useCallback(
221:     (form: string) => {
222:       if (feedback === 'correct') return;
223: 
224:       setSelectedForm(form);
225:       setAttempts((a) => a + 1);
226: 
227:       const isCorrect = form.trim().toLowerCase() === correctForm.trim().toLowerCase();
228: 
229:       if (isCorrect) {
230:         setFeedback('correct');
231:         // Mark practiced & return to voyage after a brief celebratory pause
232:         if (sentence) {
233:           markPracticed(sentence.id);
234:         }
235:         setTimeout(() => {
236:           router.back();
237:         }, 1200);
238:       } else {
239:         setFeedback('incorrect');
240:         triggerShake();
241:         setTimeout(() => {
242:           setFeedback('idle');
243:           setSelectedForm(null);
244:         }, 800);
245:       }
246:     },
247:     [correctForm, feedback, sentence, markPracticed, router, triggerShake],
248:   );
249: 
250:   // ── Feedback-dependent styling ────────────────────────────────────────
251:   const blankBorderColor =
252:     feedback === 'correct' ? C.SUCCESS :
253:       feedback === 'incorrect' ? C.ERROR :
254:         C.GOLD;
255: 
256:   const blankBgColor =
257:     feedback === 'correct' ? 'rgba(52, 211, 153, 0.15)' :
258:       feedback === 'incorrect' ? 'rgba(239, 68, 68, 0.15)' :
259:         'rgba(197, 160, 89, 0.06)';
260: 
261:   // ── Guard: no sentence / no knot ──────────────────────────────────────
262:   if (!sentence || !challengeKnot) {
263:     return (
264:       <SafeAreaView style={styles.safeArea}>
265:         <View style={styles.voidContainer}>
266:           <Text style={styles.voidSymbol}>Ψ</Text>
267:           <Text style={styles.voidText}>Poseidon has struck this land; no mortal may practice here yet.</Text>
268:           <Pressable onPress={() => router.back()} style={styles.backLink}>
269:             <Text style={styles.backLinkText}>Return to Voyage</Text>
270:           </Pressable>
271:         </View>
272:       </SafeAreaView>
273:     );
274:   }
275: 
276:   const hasParadigm = hasUsableParadigm(challengeKnot.paradigm);
277: 
278:   return (
279:     <SafeAreaView style={styles.safeArea}>
280:       {/* ── Header ─────────────────────────────────────────────────────── */}
281:       <View style={styles.header}>
282:         <Pressable onPress={() => router.back()} hitSlop={12}>
283:           <IconButton icon="arrow-left" iconColor={C.GOLD} size={22} />
284:         </Pressable>
285:         <View style={styles.headerCenter}>
286:           <Text style={styles.eyebrow}>THE LAPIDARY'S TABLE</Text>
287:           <Text style={styles.headerLemma}>
288:             {challengeKnot.lemma && challengeKnot.lemma !== 'UNKNOWN'
289:               ? challengeKnot.lemma
290:               : challengeKnot.text && challengeKnot.text !== 'UNKNOWN'
291:                 ? challengeKnot.text
292:                 : challengeKnot.pos || 'Practice'}
293:           </Text>
294:         </View>
295:         <View style={{ width: 44 }} />
296:       </View>
297: 
298:       <ScrollView
299:         contentContainerStyle={styles.scrollContent}
300:         showsVerticalScrollIndicator={false}
301:       >
302:         {/* ── Sentence Card: Lexical Array with INLINE blank ────────── */}
303:         <Animated.View
304:           style={[
305:             styles.sentenceCard,
306:             { transform: [{ translateX: shakeAnim }] },
307:           ]}
308:         >
309:           {/* Flex-wrap row: each chunk is a physical inline entity */}
310:           <View style={styles.sentenceRow}>
311:             {chunks.map((chunk, i) => {
312:               // ── Delimiter chunk (whitespace / punctuation) → plain Text ──
313:               if (/^[\s.,;:!?]+$/.test(chunk)) {
314:                 return <Text key={i} style={styles.punctText}>{chunk}</Text>;
315:               }
316: 
317:               // ── Word chunk → check if it's the challenge knot ─────────
318:               const knot = findKnot(chunk, sentence.knots);
319:               const isChallengeWord =
320:                 knot != null &&
321:                 challengeKnot != null &&
322:                 knot.id === challengeKnot.id;
323: 
324:               if (isChallengeWord) {
325:                 // ── INLINE DASHED BLANK BOX ─────────────────────────
326:                 return (
327:                   <View
328:                     key={i}
329:                     style={[
330:                       styles.blankBox,
331:                       { borderColor: blankBorderColor, backgroundColor: blankBgColor },
332:                     ]}
333:                   >
334:                     <Text
335:                       style={[
336:                         styles.blankText,
337:                         feedback === 'correct' && styles.blankTextCorrect,
338:                         feedback === 'incorrect' && styles.blankTextIncorrect,
339:                       ]}
340:                     >
341:                       {feedback === 'correct' ? correctForm : selectedForm || '_______'}
342:                     </Text>
343:                   </View>
344:                 );
345:               }
346: 
347:               // ── Other knot word → gold ────────────────────────────
348:               if (knot) {
349:                 return (
350:                   <Text key={i} style={styles.sentenceKnotWord}>{chunk}</Text>
351:                 );
352:               }
353: 
354:               // ── Plain word ────────────────────────────────────────
355:               return (
356:                 <Text key={i} style={styles.sentenceWord}>{chunk}</Text>
357:               );
358:             })}
359:           </View>
360: 
361:           {/* Translation hint */}
362:           <View style={styles.translationRow}>
363:             <View style={styles.translationDivider} />
364:             <Text style={styles.translationText}>{sentence.translation}</Text>
365:           </View>
366: 
367:           {/* Feedback indicator */}
368:           {feedback !== 'idle' && (
369:             <View style={styles.feedbackRow}>
370:               <Text
371:                 style={[
372:                   styles.feedbackText,
373:                   feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect,
374:                 ]}
375:               >
376:                 {feedback === 'correct' ? 'Correct!' : 'Try again'}
377:               </Text>
378:               {feedback === 'correct' && attempts > 1 && (
379:                 <Text style={styles.attemptsText}>{attempts} attempts</Text>
380:               )}
381:             </View>
382:           )}
383:         </Animated.View>
384: 
385:         {/* ── Quiz Option Buttons: 5 paradigm forms below the sentence ── */}
386:         {hasParadigm && quizOptions.length > 0 ? (
387:           <View style={styles.gridSection}>
388:             <Text style={styles.gridLabel}>
389:               Select the correct form of{' '}
390:               <Text style={styles.gridLemma}>{challengeKnot.lemma}</Text>
391:             </Text>
392:             <View style={styles.quizOptionsContainer}>
393:               {quizOptions.map((form, i) => {
394:                 const isCorrectAnswer = feedback === 'correct' && form.trim().toLowerCase() === correctForm.trim().toLowerCase();
395:                 const isWrongSelection = feedback === 'incorrect' && selectedForm === form;
396:                 return (
397:                   <Pressable
398:                     key={`${form}-${i}`}
399:                     style={({ pressed }) => [
400:                       styles.quizOption,
401:                       pressed && styles.quizOptionPressed,
402:                       isCorrectAnswer && styles.quizOptionCorrect,
403:                       isWrongSelection && styles.quizOptionIncorrect,
404:                     ]}
405:                     onPress={() => feedback !== 'correct' && handleCellPress(form)}
406:                     disabled={feedback === 'correct'}
407:                   >
408:                     <Text
409:                       style={[
410:                         styles.quizOptionText,
411:                         isCorrectAnswer && styles.quizOptionTextCorrect,
412:                         isWrongSelection && styles.quizOptionTextIncorrect,
413:                       ]}
414:                     >
415:                       {form}
416:                     </Text>
417:                   </Pressable>
418:                 );
419:               })}
420:             </View>
421:           </View>
422:         ) : (
423:           <View style={styles.gridSection}>
424:             <Text style={styles.gridLabel}>
425:               No paradigm data available. Return to the Voyage to continue.
426:             </Text>
427:           </View>
428:         )}
429: 
430:         {/* Success: returning banner */}
431:         {feedback === 'correct' && (
432:           <View style={styles.successBanner}>
433:             <Text style={styles.successBannerText}>
434:               Returning to Voyage...
435:             </Text>
436:           </View>
437:         )}
438:       </ScrollView>
439: 
440:       {/* ── Footer: Prev / Next sentence navigation ─────────────────── */}
441:       <View style={styles.footer}>
442:         <TouchableOpacity
443:           onPress={() => prevSentence && router.replace(`/lapidary/${prevSentence.id}` as any)}
444:           disabled={!prevSentence}
445:           style={[styles.navButton, !prevSentence && styles.navButtonDisabled]}
446:         >
447:           <IconButton
448:             icon="chevron-left"
449:             iconColor={!prevSentence ? 'rgba(197, 160, 89, 0.3)' : C.GOLD}
450:             size={28}
451:           />
452:           <Text style={[styles.navLabel, !prevSentence && styles.navLabelDisabled]}>Prev</Text>
453:         </TouchableOpacity>
454: 
455:         {/* Counter */}
456:         <Text style={styles.footerCounter}>
457:           {sentenceIndex >= 0 ? sentenceIndex + 1 : '?'} / {total}
458:         </Text>
459: 
460:         <TouchableOpacity
461:           onPress={() => nextSentence && router.replace(`/lapidary/${nextSentence.id}` as any)}
462:           disabled={!nextSentence}
463:           style={[styles.navButton, !nextSentence && styles.navButtonDisabled]}
464:         >
465:           <Text style={[styles.navLabel, !nextSentence && styles.navLabelDisabled]}>Next</Text>
466:           <IconButton
467:             icon="chevron-right"
468:             iconColor={!nextSentence ? 'rgba(197, 160, 89, 0.3)' : C.GOLD}
469:             size={28}
470:           />
471:         </TouchableOpacity>
472:       </View>
473:     </SafeAreaView>
474:   );
475: }
476: 
477: // ── Styles ───────────────────────────────────────────────────────────────────
478: 
479: const styles = StyleSheet.create({
480:   safeArea: {
481:     flex: 1,
482:     backgroundColor: 'transparent',
483:   },
484: 
485:   // ── Header ──────────────────────────────────────────────────────────────
486:   header: {
487:     flexDirection: 'row',
488:     alignItems: 'center',
489:     paddingHorizontal: 8,
490:     paddingVertical: 4,
491:     borderBottomWidth: 1,
492:     borderBottomColor: 'rgba(197, 160, 89, 0.1)',
493:   },
494:   headerCenter: {
495:     flex: 1,
496:     alignItems: 'center',
497:   },
498:   eyebrow: {
499:     fontFamily: F.LABEL,
500:     fontSize: 8,
501:     fontWeight: 'bold',
502:     letterSpacing: 3,
503:     color: C.GOLD,
504:     textTransform: 'uppercase',
505:   },
506:   headerLemma: {
507:     fontFamily: F.DISPLAY,
508:     fontSize: 20,
509:     color: C.PARCHMENT,
510:     marginTop: 2,
511:   },
512: 
513:   scrollContent: {
514:     padding: 20,
515:     paddingBottom: 60,
516:     gap: 20,
517:   },
518: 
519:   // ── Sentence Card ─────────────────────────────────────────────────────
520:   sentenceCard: {
521:     backgroundColor: C.SURFACE,
522:     borderWidth: 1,
523:     borderColor: C.GOLD_DIM,
524:     borderRadius: 16,
525:     padding: 24,
526:     gap: 16,
527:   },
528: 
529:   // ── Lexical Array: flex-wrap row ──────────────────────────────────────
530:   sentenceRow: {
531:     flexDirection: 'row',
532:     flexWrap: 'wrap',
533:     justifyContent: 'center',
534:     alignItems: 'center',
535:   },
536:   punctText: {
537:     fontFamily: F.DISPLAY,
538:     fontSize: 22,
539:     color: 'rgba(227, 220, 203, 0.5)',
540:     lineHeight: 36,
541:   },
542:   sentenceWord: {
543:     fontFamily: F.DISPLAY,
544:     fontSize: 22,
545:     color: 'rgba(227, 220, 203, 0.7)',
546:     lineHeight: 36,
547:   },
548:   sentenceKnotWord: {
549:     fontFamily: F.DISPLAY,
550:     fontSize: 22,
551:     color: C.GOLD,
552:     lineHeight: 36,
553:   },
554: 
555:   // ── Inline dashed blank box ───────────────────────────────────────────
556:   blankBox: {
557:     borderWidth: 2,
558:     borderStyle: 'dashed',
559:     borderRadius: 8,
560:     paddingHorizontal: 14,
561:     paddingVertical: 4,
562:     marginHorizontal: 4,
563:   },
564:   blankText: {
565:     fontFamily: F.DISPLAY,
566:     fontSize: 20,
567:     color: C.GOLD,
568:     fontStyle: 'italic',
569:   },
570:   blankTextCorrect: {
571:     color: C.SUCCESS,
572:     fontStyle: 'normal',
573:     fontWeight: 'bold',
574:   },
575:   blankTextIncorrect: {
576:     color: C.ERROR,
577:   },
578: 
579:   // Translation
580:   translationRow: {
581:     alignItems: 'center',
582:     gap: 10,
583:   },
584:   translationDivider: {
585:     width: 40,
586:     height: 1,
587:     backgroundColor: 'rgba(197, 160, 89, 0.25)',
588:     borderRadius: 1,
589:   },
590:   translationText: {
591:     fontFamily: F.DISPLAY,
592:     fontSize: 13,
593:     color: C.GRAY_TEXT,
594:     fontStyle: 'italic',
595:     textAlign: 'center',
596:     lineHeight: 20,
597:   },
598:   feedbackRow: {
599:     flexDirection: 'row',
600:     alignItems: 'center',
601:     justifyContent: 'center',
602:     gap: 10,
603:   },
604:   feedbackText: {
605:     fontFamily: F.LABEL,
606:     fontSize: 13,
607:     fontWeight: 'bold',
608:     letterSpacing: 1,
609:   },
610:   feedbackCorrect: {
611:     color: C.SUCCESS,
612:   },
613:   feedbackIncorrect: {
614:     color: C.ERROR,
615:   },
616:   attemptsText: {
617:     fontFamily: F.LABEL,
618:     fontSize: 10,
619:     color: C.GRAY_TEXT,
620:   },
621: 
622:   // ── Grid Section ──────────────────────────────────────────────────────
623:   gridSection: {
624:     gap: 12,
625:   },
626:   gridLabel: {
627:     fontFamily: F.LABEL,
628:     fontSize: 11,
629:     color: C.GRAY_TEXT,
630:     letterSpacing: 0.3,
631:     textAlign: 'center',
632:   },
633:   gridLemma: {
634:     fontFamily: F.DISPLAY,
635:     color: C.PARCHMENT,
636:     fontStyle: 'italic',
637:   },
638: 
639:   // ── Quiz Option Buttons (5 paradigm forms) ────────────────────────────
640:   quizOptionsContainer: {
641:     gap: 10,
642:   },
643:   quizOption: {
644:     backgroundColor: 'rgba(10, 15, 13, 0.5)',
645:     borderWidth: 1.5,
646:     borderColor: C.GRAY_BORDER,
647:     borderRadius: 12,
648:     paddingVertical: 16,
649:     paddingHorizontal: 20,
650:     alignItems: 'center',
651:   },
652:   quizOptionPressed: {
653:     backgroundColor: C.GOLD_DIM,
654:     borderColor: C.GOLD,
655:   },
656:   quizOptionCorrect: {
657:     borderColor: C.SUCCESS,
658:     backgroundColor: 'rgba(52, 211, 153, 0.15)',
659:   },
660:   quizOptionIncorrect: {
661:     borderColor: C.ERROR,
662:     backgroundColor: 'rgba(239, 68, 68, 0.15)',
663:   },
664:   quizOptionText: {
665:     fontFamily: F.DISPLAY,
666:     fontSize: 20,
667:     color: C.PARCHMENT,
668:   },
669:   quizOptionTextCorrect: {
670:     color: C.SUCCESS,
671:     fontWeight: 'bold' as const,
672:   },
673:   quizOptionTextIncorrect: {
674:     color: C.ERROR,
675:   },
676: 
677:   // ── Success Banner ────────────────────────────────────────────────────
678:   successBanner: {
679:     alignItems: 'center',
680:     paddingVertical: 16,
681:   },
682:   successBannerText: {
683:     fontFamily: F.LABEL,
684:     fontSize: 11,
685:     color: C.SUCCESS,
686:     letterSpacing: 1,
687:     fontStyle: 'italic',
688:   },
689: 
690:   // ── Void / Error ──────────────────────────────────────────────────────
691:   voidContainer: {
692:     flex: 1,
693:     justifyContent: 'center',
694:     alignItems: 'center',
695:     gap: 16,
696:     padding: 24,
697:   },
698:   voidSymbol: {
699:     fontFamily: F.DISPLAY,
700:     fontSize: 48,
701:     color: 'rgba(197, 160, 89, 0.2)',
702:   },
703:   voidText: {
704:     fontFamily: F.DISPLAY,
705:     fontSize: 16,
706:     color: C.GRAY_TEXT,
707:     fontStyle: 'italic',
708:     textAlign: 'center',
709:   },
710:   backLink: {
711:     marginTop: 12,
712:     borderWidth: 1,
713:     borderColor: C.GOLD_DIM,
714:     borderRadius: 10,
715:     paddingHorizontal: 20,
716:     paddingVertical: 10,
717:   },
718:   backLinkText: {
719:     fontFamily: F.LABEL,
720:     fontSize: 12,
721:     fontWeight: 'bold',
722:     color: C.GOLD,
723:     letterSpacing: 1,
724:     textTransform: 'uppercase',
725:   },
726: 
727:   // ── Footer Navigation ────────────────────────────────────────────────
728:   footer: {
729:     flexDirection: 'row',
730:     justifyContent: 'space-between',
731:     alignItems: 'center',
732:     paddingHorizontal: 20,
733:     paddingBottom: 8,
734:     paddingTop: 4,
735:     borderTopWidth: 1,
736:     borderTopColor: 'rgba(197, 160, 89, 0.1)',
737:   },
738:   navButton: {
739:     flexDirection: 'row',
740:     alignItems: 'center',
741:     paddingVertical: 8,
742:     paddingHorizontal: 4,
743:   },
744:   navButtonDisabled: {
745:     opacity: 0.35,
746:   },
747:   navLabel: {
748:     fontFamily: F.LABEL,
749:     fontSize: 13,
750:     color: C.GOLD,
751:     fontWeight: 'bold',
752:     letterSpacing: 0.5,
753:   },
754:   navLabelDisabled: {
755:     color: 'rgba(197, 160, 89, 0.4)',
756:   },
757:   footerCounter: {
758:     fontFamily: F.LABEL,
759:     fontSize: 11,
760:     color: C.GRAY_TEXT,
761:     letterSpacing: 1,
762:   },
763: });

(End of file - total 763 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/results.tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/results.tsx</path>
<type>file</type>
<content>
1: import { Stack, useRouter } from 'expo-router';
2: import { useEffect, useState } from 'react';
3: import { ActivityIndicator, Pressable, Text, View } from 'react-native';
4: import PhilologyCard from '../components/PhilologyCard';
5: import { Token } from '../components/WordChip';
6: import ConstellationMap from '../screens/ConstellationMap';
7: import { ApiService } from '../src/services/ApiService';
8: import { ConstellationLink, ConstellationNode } from '../src/types';
9: import { useInspectorStore, toKnot } from '../src/store/unifiedInspectorStore';
10: 
11: export default function ResultsScreen() {
12:   const router = useRouter();
13:   const [nodes, setNodes] = useState<ConstellationNode[]>([]);
14:   const [links, setLinks] = useState<ConstellationLink[]>([]);
15:   const [goldenPath, setGoldenPath] = useState<string[]>([]);
16:   const [isWeaving, setIsWeaving] = useState(false);
17: 
18:   // Interaction State
19:   const [activeNode, setActiveNode] = useState<ConstellationNode | null>(null);
20: 
21:   // Global Inspector Store
22:   const { openInspector, closeInspector, knot: selectedToken } = useInspectorStore();
23: 
24:   useEffect(() => {
25:     // TODO: migrate draft loading to Zustand store (SessionStore purged in Phase 2)
26:     const draft: any = null;
27:     if (!draft) return;
28: 
29:     let data = draft;
30:     if (typeof draft === 'string') {
31:       try { data = JSON.parse(draft); } catch { /* Silent failure */ }
32:     }
33: 
34:     if (data) {
35:       if (Array.isArray(data.nodes)) {
36:         setNodes(data.nodes);
37:         setLinks(data.links || []);
38:         setGoldenPath(data.golden_path || []);
39:       } else if (Array.isArray(data)) {
40:         setNodes(data);
41:         setLinks([]);
42:       }
43:     }
44:   }, []);
45: 
46:   const handleWeave = async () => {
47:     if (isWeaving || nodes.length === 0) return;
48:     setIsWeaving(true);
49: 
50:     try {
51:       const result = await ApiService.fillCurriculum({ worksheet_data: nodes });
52:       const updatedNodes = result.worksheet_data;
53: 
54:       if (!Array.isArray(updatedNodes)) {
55:         throw new Error("Invalid response structure from server: worksheet_data is not an array.");
56:       }
57: 
58:       setNodes(prevNodes => {
59:         // efficient lookup map
60:         const updateMap = new Map(updatedNodes.map(n => [n.id, n]));
61:         return prevNodes.map(node => {
62:           const match = updateMap.get(node.id);
63:           if (match) {
64:             const hasTarget = !!match.data?.target_sentence;
65:             return {
66:               ...node, // Keep the original node
67:               data: match.data, // Overwrite with the updated data from the server
68:               status: hasTarget ? 'mastered' : node.status, // Update status
69:               // Preserve simulation coordinates
70:               x: node.x,
71:               y: node.y,
72:               vx: node.vx,
73:               vy: node.vy,
74:             };
75:           }
76:           return node;
77:         });
78:       });
79: 
80:     } catch (error) {
81:        // Ideally show a toast or alert here
82:        // No console.log for code health
83:     } finally {
84:       setIsWeaving(false);
85:     }
86:   };
87: 
88:   const handleNodePress = (node: ConstellationNode) => {
89:     setActiveNode(node);
90:     closeInspector();
91:   };
92: 
93:   const handleTokenPress = (token: Token) => {
94:     openInspector(token);
95:   };
96: 
97:   return (
98:     <View style={{ flex: 1, backgroundColor: 'transparent' }}>
99:       <Stack.Screen options={{ headerShown: false }} />
100:       {nodes.length > 0 ? (
101:         <>
102:           <ConstellationMap
103:             nodes={nodes}
104:             links={links}
105:             goldenPath={goldenPath}
106:             onNodePress={handleNodePress}
107:           />
108: 
109:           {/* Actuator FAB */}
110:           <Pressable
111:             onPress={handleWeave}
112:             disabled={isWeaving}
113:             style={({ pressed }) => ({
114:               position: 'absolute',
115:               bottom: 40,
116:               right: 20,
117:               // THE GOLDEN GRADIENT (Simulated with background color + border)
118:               backgroundColor: '#1a1918', // Obsidian Core
119:               borderWidth: 1,
120:               borderColor: '#C5A059', // Solid Gold Border
121: 
122:               // THE SHAPE
123:               paddingHorizontal: 24,
124:               paddingVertical: 16,
125:               borderRadius: 100, // Pill Shape
126: 
127:               // THE GLOW (Shadows)
128:               shadowColor: '#C5A059',
129:               shadowOffset: { width: 0, height: 0 },
130:               shadowOpacity: 0.6,
131:               shadowRadius: 10,
132:               elevation: 10, // Android Glow
133: 
134:               // INTERACTION
135:               opacity: pressed || isWeaving ? 0.8 : 1,
136:               zIndex: 100,
137:               flexDirection: 'row',
138:               alignItems: 'center',
139:               gap: 12,
140:             })}
141:           >
142:             {isWeaving ? (
143:               <ActivityIndicator color="#C5A059" size="small" />
144:             ) : (
145:               <Text style={{
146:                 color: '#E3DCCB', // Parchment Text
147:                 fontWeight: '600',
148:                 fontSize: 16,
149:                 fontFamily: 'NeueHaasGrotesk-Display', // The Noble Font
150:                 letterSpacing: 1,
151:                 textTransform: 'uppercase'
152:               }}>
153:                 Weave Sentences
154:               </Text>
155:             )}
156:           </Pressable>
157: 
158:           {/* Philology Card (Conditional) */}
159:           {activeNode && (activeNode.data?.target_sentence || activeNode.data?.source_sentence) && (
160:             <PhilologyCard
161:               sentence={activeNode.data?.target_sentence || activeNode.data?.source_sentence || ""}
162:               tokens={activeNode.data?.target_tokens}
163:               translation={activeNode.data?.source_sentence || activeNode.data?.target_sentence || ""}
164:               onTokenPress={handleTokenPress}
165:               selectedToken={selectedToken}
166:             />
167:           )}
168: 
169:         </>
170:       ) : (
171:         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
172:           <Text style={{
173:             color: '#E3DCCB',
174:             fontSize: 24,
175:             textAlign: 'center',
176:             marginBottom: 16,
177:             fontWeight: 'bold',
178:             opacity: 0.9
179:           }}>
180:             No Result Data
181:           </Text>
182:           <Text style={{
183:             color: '#E3DCCB',
184:             fontSize: 16,
185:             textAlign: 'center',
186:             opacity: 0.7,
187:             lineHeight: 24
188:           }}>
189:             Unable to load the constellation from history.
190:           </Text>
191:         </View>
192:       )}
193:     </View>
194:   );
195: }

(End of file - total 195 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/login.tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/login.tsx</path>
<type>file</type>
<content>
1: // ── THE GATE OF THE SCRIPTORIUM ──────────────────────────────────────────────
2: // Byzantine-themed login screen. Two paths: Google OAuth or Guest (Initiate).
3: 
4: import { BlurView } from 'expo-blur';
5: import { useRouter } from 'expo-router';
6: import { useState } from 'react';
7: import {
8:   ActivityIndicator,
9:   Platform,
10:   Pressable,
11:   StyleSheet,
12:   Text,
13:   View,
14: } from 'react-native';
15: import { SafeAreaView } from 'react-native-safe-area-context';
16: 
17: import { useAuthStore } from '../src/store/authStore';
18: 
19: // ── Design Tokens ────────────────────────────────────────────────────────────
20: const GOLD = '#C5A059';
21: const GOLD_DIM = 'rgba(197, 160, 89, 0.15)';
22: const PARCHMENT = '#E3DCCB';
23: const GRAY_TEXT = '#9CA3AF';
24: const SURFACE = 'rgba(15, 5, 24, 0.6)';
25: 
26: export default function LoginScreen() {
27:   const router = useRouter();
28:   const { signInWithGoogle, continueAsGuest, devBypass } = useAuthStore();
29:   const [isSigningIn, setIsSigningIn] = useState(false);
30:   const [error, setError] = useState<string | null>(null);
31:   const isDevMode = process.env.EXPO_PUBLIC_DEV_MODE === 'true';
32: 
33:   const handleGoogleSignIn = async () => {
34:     setIsSigningIn(true);
35:     setError(null);
36:     try {
37:       await signInWithGoogle();
38:     } catch (e: any) {
39:       setError(e?.message ?? 'Authentication failed. Please try again.');
40:     } finally {
41:       setIsSigningIn(false);
42:     }
43:   };
44: 
45:   const handleGuestEntry = () => {
46:     if (isDevMode) {
47:       devBypass();
48:     } else {
49:       continueAsGuest();
50:     }
51:     // Auth guard in _layout will redirect to (tabs)
52:   };
53: 
54:   return (
55:     <SafeAreaView style={styles.safeArea}>
56:       <View style={styles.container}>
57: 
58:         {/* ── The Crest ─────────────────────────────────────────────────── */}
59:         <View style={styles.crestContainer}>
60:           <View style={styles.crestRing}>
61:             <Text style={styles.crestSymbol}>Ω</Text>
62:           </View>
63:         </View>
64: 
65:         {/* ── Title Block ───────────────────────────────────────────────── */}
66:         <View style={styles.titleBlock}>
67:           <Text style={styles.appTitle}>Kombyphantike</Text>
68:           <View style={styles.titleDivider} />
69:           <Text style={styles.appSubtitle}>
70:             The Byzantine Scriptorium
71:           </Text>
72:           <Text style={styles.appTagline}>
73:             Where Modern Greek meets its Ancient roots
74:           </Text>
75:         </View>
76: 
77:         {/* ── Action Panel (Frosted Glass) ──────────────────────────────── */}
78:         <View style={styles.actionPanel}>
79:           {Platform.OS !== 'web' ? (
80:             <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
81:           ) : null}
82:           <View style={styles.actionPanelOverlay} />
83: 
84:           <View style={styles.actionContent}>
85:             {/* Google Sign In */}
86:             <Pressable
87:               onPress={handleGoogleSignIn}
88:               disabled={isSigningIn}
89:               style={({ pressed }) => [
90:                 styles.googleButton,
91:                 pressed && styles.buttonPressed,
92:                 isSigningIn && styles.buttonDisabled,
93:               ]}
94:             >
95:               {isSigningIn ? (
96:                 <ActivityIndicator size="small" color="#1a1918" />
97:               ) : (
98:                 <>
99:                   <Text style={styles.googleIcon}>G</Text>
100:                   <Text style={styles.googleButtonText}>Sign in with Google</Text>
101:                 </>
102:               )}
103:             </Pressable>
104: 
105:             {/* Divider */}
106:             <View style={styles.orDivider}>
107:               <View style={styles.orLine} />
108:               <Text style={styles.orText}>or</Text>
109:               <View style={styles.orLine} />
110:             </View>
111: 
112:             {/* Guest Entry */}
113:             <Pressable
114:               onPress={handleGuestEntry}
115:               style={({ pressed }) => [
116:                 styles.guestButton,
117:                 pressed && styles.buttonPressed,
118:               ]}
119:             >
120:               <Text style={styles.guestButtonText}>Continue as Initiate</Text>
121:               <Text style={styles.guestSubtext}>Free tier · A1–A2 islands</Text>
122:             </Pressable>
123: 
124:             {/* Error */}
125:             {error && (
126:               <Text style={styles.errorText}>{error}</Text>
127:             )}
128: 
129:             {/* DEV BYPASS — visible only when EXPO_PUBLIC_DEV_MODE=true */}
130:             {isDevMode && (
131:               <>
132:                 <View style={styles.orDivider}>
133:                   <View style={styles.orLine} />
134:                   <Text style={[styles.orText, { color: '#EF4444' }]}>dev</Text>
135:                   <View style={styles.orLine} />
136:                 </View>
137:                 <Pressable
138:                   onPress={devBypass}
139:                   style={({ pressed }) => [styles.devButton, pressed && styles.buttonPressed]}
140:                 >
141:                   <Text style={styles.devButtonText}>DEV BYPASS</Text>
142:                   <Text style={styles.devButtonSub}>Scholar · No auth required</Text>
143:                 </Pressable>
144:               </>
145:             )}
146:           </View>
147:         </View>
148: 
149:         {/* ── Footer ────────────────────────────────────────────────────── */}
150:         <Text style={styles.footerText}>
151:           Scholars unlock the full philological depth{'\n'}
152:           LSJ Citations · B1+ Islands · Diachronic Analysis
153:         </Text>
154: 
155:       </View>
156:     </SafeAreaView>
157:   );
158: }
159: 
160: const styles = StyleSheet.create({
161:   safeArea: {
162:     flex: 1,
163:     backgroundColor: 'transparent',
164:   },
165:   container: {
166:     flex: 1,
167:     justifyContent: 'center',
168:     alignItems: 'center',
169:     paddingHorizontal: 32,
170:   },
171: 
172:   // ── Crest ─────────────────────────────────────────────────────────────────
173:   crestContainer: {
174:     marginBottom: 32,
175:     alignItems: 'center',
176:   },
177:   crestRing: {
178:     width: 96,
179:     height: 96,
180:     borderRadius: 48,
181:     borderWidth: 2,
182:     borderColor: GOLD,
183:     backgroundColor: GOLD_DIM,
184:     alignItems: 'center',
185:     justifyContent: 'center',
186:   },
187:   crestSymbol: {
188:     fontFamily: 'GFSDidot',
189:     fontSize: 48,
190:     color: GOLD,
191:   },
192: 
193:   // ── Title Block ───────────────────────────────────────────────────────────
194:   titleBlock: {
195:     alignItems: 'center',
196:     marginBottom: 48,
197:   },
198:   appTitle: {
199:     fontFamily: 'GFSDidot',
200:     fontSize: 36,
201:     color: PARCHMENT,
202:     letterSpacing: 1,
203:     textAlign: 'center',
204:   },
205:   titleDivider: {
206:     width: 60,
207:     height: 1,
208:     backgroundColor: GOLD,
209:     marginVertical: 12,
210:   },
211:   appSubtitle: {
212:     fontFamily: 'GFSDidot',
213:     fontSize: 16,
214:     color: GOLD,
215:     fontStyle: 'italic',
216:     textAlign: 'center',
217:     letterSpacing: 0.5,
218:   },
219:   appTagline: {
220:     fontFamily: 'NeueHaasGrotesk',
221:     fontSize: 13,
222:     color: GRAY_TEXT,
223:     textAlign: 'center',
224:     marginTop: 8,
225:   },
226: 
227:   // ── Action Panel ──────────────────────────────────────────────────────────
228:   actionPanel: {
229:     width: '100%',
230:     borderRadius: 20,
231:     borderWidth: 1,
232:     borderColor: 'rgba(197, 160, 89, 0.2)',
233:     overflow: 'hidden',
234:     marginBottom: 32,
235:   },
236:   actionPanelOverlay: {
237:     ...StyleSheet.absoluteFillObject,
238:     backgroundColor: SURFACE,
239:   },
240:   actionContent: {
241:     padding: 28,
242:     gap: 16,
243:   },
244: 
245:   // ── Google Button ─────────────────────────────────────────────────────────
246:   googleButton: {
247:     flexDirection: 'row',
248:     alignItems: 'center',
249:     justifyContent: 'center',
250:     backgroundColor: GOLD,
251:     borderRadius: 12,
252:     paddingVertical: 16,
253:     gap: 10,
254:   },
255:   googleIcon: {
256:     fontFamily: 'NeueHaasGrotesk',
257:     fontSize: 18,
258:     fontWeight: 'bold',
259:     color: '#1a1918',
260:   },
261:   googleButtonText: {
262:     fontFamily: 'NeueHaasGrotesk',
263:     fontSize: 16,
264:     fontWeight: 'bold',
265:     color: '#1a1918',
266:     letterSpacing: 0.3,
267:   },
268:   buttonPressed: {
269:     opacity: 0.7,
270:   },
271:   buttonDisabled: {
272:     opacity: 0.5,
273:   },
274: 
275:   // ── Or Divider ────────────────────────────────────────────────────────────
276:   orDivider: {
277:     flexDirection: 'row',
278:     alignItems: 'center',
279:     gap: 12,
280:   },
281:   orLine: {
282:     flex: 1,
283:     height: 1,
284:     backgroundColor: 'rgba(55, 65, 81, 0.6)',
285:   },
286:   orText: {
287:     fontFamily: 'NeueHaasGrotesk',
288:     fontSize: 12,
289:     color: GRAY_TEXT,
290:     textTransform: 'uppercase',
291:     letterSpacing: 1,
292:   },
293: 
294:   // ── Guest Button ──────────────────────────────────────────────────────────
295:   guestButton: {
296:     alignItems: 'center',
297:     justifyContent: 'center',
298:     borderWidth: 1,
299:     borderColor: 'rgba(197, 160, 89, 0.3)',
300:     borderRadius: 12,
301:     paddingVertical: 14,
302:     backgroundColor: 'rgba(197, 160, 89, 0.06)',
303:   },
304:   guestButtonText: {
305:     fontFamily: 'NeueHaasGrotesk',
306:     fontSize: 15,
307:     color: PARCHMENT,
308:     letterSpacing: 0.3,
309:   },
310:   guestSubtext: {
311:     fontFamily: 'NeueHaasGrotesk',
312:     fontSize: 11,
313:     color: GRAY_TEXT,
314:     marginTop: 4,
315:   },
316: 
317:   // ── Error ─────────────────────────────────────────────────────────────────
318:   errorText: {
319:     fontFamily: 'NeueHaasGrotesk',
320:     fontSize: 13,
321:     color: '#EF4444',
322:     textAlign: 'center',
323:   },
324: 
325:   // ── Dev Bypass ────────────────────────────────────────────────────────────
326:   devButton: {
327:     alignItems: 'center',
328:     justifyContent: 'center',
329:     borderWidth: 1,
330:     borderColor: 'rgba(239, 68, 68, 0.4)',
331:     borderRadius: 12,
332:     paddingVertical: 12,
333:     backgroundColor: 'rgba(239, 68, 68, 0.06)',
334:   },
335:   devButtonText: {
336:     fontFamily: 'NeueHaasGrotesk',
337:     fontSize: 13,
338:     color: '#EF4444',
339:     fontWeight: 'bold',
340:     letterSpacing: 2,
341:     textTransform: 'uppercase',
342:   },
343:   devButtonSub: {
344:     fontFamily: 'NeueHaasGrotesk',
345:     fontSize: 10,
346:     color: 'rgba(239, 68, 68, 0.6)',
347:     marginTop: 2,
348:   },
349: 
350:   // ── Footer ────────────────────────────────────────────────────────────────
351:   footerText: {
352:     fontFamily: 'NeueHaasGrotesk',
353:     fontSize: 11,
354:     color: 'rgba(156, 163, 175, 0.6)',
355:     textAlign: 'center',
356:     lineHeight: 18,
357:   },
358: });

(End of file - total 358 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/paywall.tsx"
}
```

**Output:**
```
<path>/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/paywall.tsx</path>
<type>file</type>
<content>
1: // ── THE SCHOLAR'S GATE ───────────────────────────────────────────────────────
2: // Frosted-glass comparison view: Initiate (free) vs Scholar (paid) tiers.
3: // Highlights the philological depth unlocked by the Scholar tier.
4: 
5: import { BlurView } from 'expo-blur';
6: import { useRouter } from 'expo-router';
7: import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
8: import { SafeAreaView } from 'react-native-safe-area-context';
9: import { IconButton } from 'react-native-paper';
10: 
11: // ── Design Tokens ────────────────────────────────────────────────────────────
12: const GOLD = '#C5A059';
13: const GOLD_DIM = 'rgba(197, 160, 89, 0.15)';
14: const PARCHMENT = '#E3DCCB';
15: const GRAY_TEXT = '#9CA3AF';
16: const GRAY_BORDER = 'rgba(55, 65, 81, 0.6)';
17: const SURFACE = 'rgba(15, 5, 24, 0.6)';
18: const CHECK = '\u2713';
19: const LOCK = '\u2717';
20: 
21: interface FeatureRow {
22:   label: string;
23:   initiate: boolean;
24:   scholar: boolean;
25: }
26: 
27: const FEATURES: FeatureRow[] = [
28:   { label: 'A1–A2 Islands', initiate: true, scholar: true },
29:   { label: 'Davidian Notes', initiate: true, scholar: true },
30:   { label: 'RAG Scholia (Holton)', initiate: true, scholar: true },
31:   { label: 'Paradigm Tables', initiate: true, scholar: true },
32:   { label: 'B1+ Islands', initiate: false, scholar: true },
33:   { label: 'LSJ Citations', initiate: false, scholar: true },
34:   { label: 'KDS Diachronic Score', initiate: false, scholar: true },
35:   { label: 'Grammar Scholia', initiate: false, scholar: true },
36:   { label: 'Constellation Graph', initiate: true, scholar: true },
37:   { label: 'Audio (Pneuma)', initiate: false, scholar: true },
38: ];
39: 
40: function FeatureCheck({ enabled }: { enabled: boolean }) {
41:   return (
42:     <View style={[styles.checkCircle, enabled ? styles.checkEnabled : styles.checkDisabled]}>
43:       <Text style={[styles.checkText, enabled ? styles.checkTextEnabled : styles.checkTextDisabled]}>
44:         {enabled ? CHECK : LOCK}
45:       </Text>
46:     </View>
47:   );
48: }
49: 
50: export default function PaywallScreen() {
51:   const router = useRouter();
52: 
53:   return (
54:     <SafeAreaView style={styles.safeArea}>
55:       {/* Back Button */}
56:       <View style={styles.headerRow}>
57:         <IconButton
58:           icon="chevron-left"
59:           iconColor={GOLD}
60:           size={28}
61:           onPress={() => router.back()}
62:         />
63:       </View>
64: 
65:       <ScrollView
66:         contentContainerStyle={styles.scrollContent}
67:         showsVerticalScrollIndicator={false}
68:       >
69:         {/* ── Title ────────────────────────────────────────────────────── */}
70:         <View style={styles.titleSection}>
71:           <Text style={styles.titleText}>The Scholar's Gate</Text>
72:           <View style={styles.titleDivider} />
73:           <Text style={styles.subtitleText}>
74:             Unlock the full philological depth
75:           </Text>
76:         </View>
77: 
78:         {/* ── Comparison Card (Frosted Glass) ──────────────────────────── */}
79:         <View style={styles.comparisonCard}>
80:           {Platform.OS !== 'web' ? (
81:             <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
82:           ) : null}
83:           <View style={styles.comparisonOverlay} />
84: 
85:           <View style={styles.comparisonContent}>
86:             {/* Column Headers */}
87:             <View style={styles.headerColumns}>
88:               <View style={styles.featureLabelCol} />
89:               <View style={styles.tierCol}>
90:                 <Text style={styles.tierLabel}>Initiate</Text>
91:                 <Text style={styles.tierPrice}>Free</Text>
92:               </View>
93:               <View style={[styles.tierCol, styles.scholarCol]}>
94:                 <Text style={[styles.tierLabel, styles.tierLabelGold]}>Scholar</Text>
95:                 <Text style={styles.tierPriceGold}>Pro</Text>
96:               </View>
97:             </View>
98: 
99:             <View style={styles.tableTopDivider} />
100: 
101:             {/* Feature Rows */}
102:             {FEATURES.map((feature, i) => (
103:               <View
104:                 key={feature.label}
105:                 style={[styles.featureRow, i % 2 === 0 && styles.featureRowAlt]}
106:               >
107:                 <View style={styles.featureLabelCol}>
108:                   <Text style={[
109:                     styles.featureLabel,
110:                     !feature.initiate && styles.featureLabelGold,
111:                   ]}>
112:                     {feature.label}
113:                   </Text>
114:                 </View>
115:                 <View style={styles.tierCol}>
116:                   <FeatureCheck enabled={feature.initiate} />
117:                 </View>
118:                 <View style={[styles.tierCol, styles.scholarCol]}>
119:                   <FeatureCheck enabled={feature.scholar} />
120:                 </View>
121:               </View>
122:             ))}
123:           </View>
124:         </View>
125: 
126:         {/* ── Highlight: Philological Depth ────────────────────────────── */}
127:         <View style={styles.highlightCard}>
128:           <View style={styles.highlightIconRow}>
129:             <View style={styles.highlightIcon}>
130:               <Text style={styles.highlightIconText}>L</Text>
131:             </View>
132:             <Text style={styles.highlightTitle}>Philological Depth</Text>
133:           </View>
134:           <Text style={styles.highlightBody}>
135:             The Scholar tier grants access to the LSJ (Liddell-Scott-Jones) lexicon citations,
136:             diachronic KDS distance scores, and B1+ Islands — the deeper waters where
137:             Ancient and Modern Greek converge. Every word becomes a bridge across millennia.
138:           </Text>
139:         </View>
140: 
141:         {/* ── CTA ──────────────────────────────────────────────────────── */}
142:         <Pressable
143:           style={({ pressed }) => [
144:             styles.ctaButton,
145:             pressed && styles.ctaPressed,
146:           ]}
147:           onPress={() => {
148:             // TODO: Connect to payment flow
149:             router.back();
150:           }}
151:         >
152:           <Text style={styles.ctaText}>Become a Scholar</Text>
153:         </Pressable>
154: 
155:         <Pressable onPress={() => router.back()}>
156:           <Text style={styles.maybeLater}>Maybe later</Text>
157:         </Pressable>
158: 
159:       </ScrollView>
160:     </SafeAreaView>
161:   );
162: }
163: 
164: const styles = StyleSheet.create({
165:   safeArea: {
166:     flex: 1,
167:     backgroundColor: 'transparent',
168:   },
169:   headerRow: {
170:     flexDirection: 'row',
171:     paddingHorizontal: 4,
172:     paddingTop: 4,
173:   },
174:   scrollContent: {
175:     paddingHorizontal: 24,
176:     paddingBottom: 60,
177:   },
178: 
179:   // ── Title ─────────────────────────────────────────────────────────────────
180:   titleSection: {
181:     alignItems: 'center',
182:     marginBottom: 28,
183:   },
184:   titleText: {
185:     fontFamily: 'GFSDidot',
186:     fontSize: 30,
187:     color: PARCHMENT,
188:     textAlign: 'center',
189:   },
190:   titleDivider: {
191:     width: 50,
192:     height: 1,
193:     backgroundColor: GOLD,
194:     marginVertical: 12,
195:   },
196:   subtitleText: {
197:     fontFamily: 'GFSDidot',
198:     fontSize: 14,
199:     color: GOLD,
200:     fontStyle: 'italic',
201:     textAlign: 'center',
202:   },
203: 
204:   // ── Comparison Card ───────────────────────────────────────────────────────
205:   comparisonCard: {
206:     borderRadius: 20,
207:     borderWidth: 1,
208:     borderColor: 'rgba(197, 160, 89, 0.2)',
209:     overflow: 'hidden',
210:     marginBottom: 24,
211:   },
212:   comparisonOverlay: {
213:     ...StyleSheet.absoluteFillObject,
214:     backgroundColor: SURFACE,
215:   },
216:   comparisonContent: {
217:     padding: 20,
218:   },
219: 
220:   // ── Column Headers ────────────────────────────────────────────────────────
221:   headerColumns: {
222:     flexDirection: 'row',
223:     alignItems: 'flex-end',
224:     paddingBottom: 12,
225:   },
226:   featureLabelCol: {
227:     flex: 1,
228:   },
229:   tierCol: {
230:     width: 72,
231:     alignItems: 'center',
232:   },
233:   scholarCol: {
234:     backgroundColor: GOLD_DIM,
235:     borderRadius: 10,
236:     paddingVertical: 6,
237:     marginLeft: 4,
238:   },
239:   tierLabel: {
240:     fontFamily: 'NeueHaasGrotesk',
241:     fontSize: 10,
242:     fontWeight: 'bold',
243:     color: GRAY_TEXT,
244:     textTransform: 'uppercase',
245:     letterSpacing: 1,
246:   },
247:   tierLabelGold: {
248:     color: GOLD,
249:   },
250:   tierPrice: {
251:     fontFamily: 'NeueHaasGrotesk',
252:     fontSize: 13,
253:     color: PARCHMENT,
254:     fontWeight: 'bold',
255:     marginTop: 2,
256:   },
257:   tierPriceGold: {
258:     fontFamily: 'GFSDidot',
259:     fontSize: 15,
260:     color: GOLD,
261:     fontWeight: 'bold',
262:     marginTop: 2,
263:   },
264: 
265:   tableTopDivider: {
266:     height: 1,
267:     backgroundColor: GRAY_BORDER,
268:     marginBottom: 4,
269:   },
270: 
271:   // ── Feature Rows ──────────────────────────────────────────────────────────
272:   featureRow: {
273:     flexDirection: 'row',
274:     alignItems: 'center',
275:     paddingVertical: 10,
276:     paddingHorizontal: 4,
277:     borderRadius: 6,
278:   },
279:   featureRowAlt: {
280:     backgroundColor: 'rgba(255, 255, 255, 0.02)',
281:   },
282:   featureLabel: {
283:     fontFamily: 'NeueHaasGrotesk',
284:     fontSize: 13,
285:     color: PARCHMENT,
286:   },
287:   featureLabelGold: {
288:     color: GOLD,
289:   },
290: 
291:   // ── Check Marks ───────────────────────────────────────────────────────────
292:   checkCircle: {
293:     width: 24,
294:     height: 24,
295:     borderRadius: 12,
296:     alignItems: 'center',
297:     justifyContent: 'center',
298:   },
299:   checkEnabled: {
300:     backgroundColor: 'rgba(52, 211, 153, 0.15)',
301:   },
302:   checkDisabled: {
303:     backgroundColor: 'rgba(107, 114, 128, 0.1)',
304:   },
305:   checkText: {
306:     fontSize: 12,
307:     fontWeight: 'bold',
308:   },
309:   checkTextEnabled: {
310:     color: '#34D399',
311:   },
312:   checkTextDisabled: {
313:     color: 'rgba(107, 114, 128, 0.4)',
314:   },
315: 
316:   // ── Highlight Card ────────────────────────────────────────────────────────
317:   highlightCard: {
318:     backgroundColor: GOLD_DIM,
319:     borderRadius: 16,
320:     borderWidth: 1,
321:     borderColor: 'rgba(197, 160, 89, 0.25)',
322:     padding: 20,
323:     marginBottom: 28,
324:   },
325:   highlightIconRow: {
326:     flexDirection: 'row',
327:     alignItems: 'center',
328:     marginBottom: 12,
329:   },
330:   highlightIcon: {
331:     width: 28,
332:     height: 28,
333:     borderRadius: 14,
334:     backgroundColor: 'rgba(197, 160, 89, 0.25)',
335:     alignItems: 'center',
336:     justifyContent: 'center',
337:     marginRight: 10,
338:   },
339:   highlightIconText: {
340:     fontFamily: 'GFSDidot',
341:     fontSize: 16,
342:     color: GOLD,
343:     fontWeight: 'bold',
344:   },
345:   highlightTitle: {
346:     fontFamily: 'NeueHaasGrotesk',
347:     fontSize: 11,
348:     fontWeight: 'bold',
349:     color: GOLD,
350:     textTransform: 'uppercase',
351:     letterSpacing: 1.5,
352:   },
353:   highlightBody: {
354:     fontFamily: 'NeueHaasGrotesk',
355:     fontSize: 13,
356:     color: PARCHMENT,
357:     lineHeight: 20,
358:   },
359: 
360:   // ── CTA ───────────────────────────────────────────────────────────────────
361:   ctaButton: {
362:     backgroundColor: GOLD,
363:     borderRadius: 14,
364:     paddingVertical: 16,
365:     alignItems: 'center',
366:     marginBottom: 12,
367:   },
368:   ctaPressed: {
369:     opacity: 0.7,
370:   },
371:   ctaText: {
372:     fontFamily: 'GFSDidot',
373:     fontSize: 18,
374:     color: '#1a1918',
375:     fontWeight: 'bold',
376:     letterSpacing: 0.5,
377:   },
378: 
379:   maybeLater: {
380:     fontFamily: 'NeueHaasGrotesk',
381:     fontSize: 13,
382:     color: GRAY_TEXT,
383:     textAlign: 'center',
384:     paddingVertical: 8,
385:   },
386: });

(End of file - total 386 lines)
</content>
```

---

## Assistant (Build · Qwen3.6-27B-4bit · 0.2s)

---

