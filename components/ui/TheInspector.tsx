import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useInspectorStore } from '../../src/store/inspectorStore';
import ParadigmGrid from '../ParadigmGrid';
import { AudioPlayer } from '../../src/services/AudioPlayer';
import { AncientContext, EtymologyJewel } from '../WordChip';

type TabType = 'grammar' | 'context' | 'family';

const CustomBackground = ({ style }: { style?: any }) => {
  return (
    <View style={[style, styles.backgroundContainer]}>
      <BlurView
        intensity={40}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.backgroundOverlay} />
    </View>
  );
};

export default function TheInspector() {
  const sheetRef = useRef<BottomSheet>(null);
  const { token, isOpen, closeInspector } = useInspectorStore();
  const [activeTab, setActiveTab] = useState<TabType>('grammar');

  const snapPoints = useMemo(() => ['50%', '85%'], []);

  useEffect(() => {
    if (isOpen && token) {
      sheetRef.current?.snapToIndex(0);
    } else if (!isOpen) {
      sheetRef.current?.close();
    }
  }, [isOpen, token]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      closeInspector();
    }
  }, [closeInspector]);

  // Styles/Colors
  const activeTabColor = '#C5A059'; // Gold
  const inactiveTabColor = '#9CA3AF'; // Gray

  const renderBadge = (label: string, isMorph: boolean = false) => (
    <View key={label} className={`px-2 py-1 rounded mr-2 mb-2 ${isMorph ? 'bg-orange-900/40 border border-orange-800' : 'bg-gray-800 border border-gray-700'}`}>
      <Text className={`text-xs uppercase font-bold ${isMorph ? 'text-orange-300' : 'text-gray-400'}`}>
        {label}
      </Text>
    </View>
  );

  const renderTabHeader = () => (
    <View className="flex-row border-b border-gray-800 mb-4">
      {(['grammar', 'context', 'family'] as TabType[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          className="flex-1 pb-3 items-center"
          style={{
            borderBottomWidth: activeTab === tab ? 2 : 0,
            borderBottomColor: activeTab === tab ? activeTabColor : 'transparent',
          }}
        >
          <Text
            style={{
              fontFamily: 'NeueHaasGrotesk-Display',
              color: activeTab === tab ? activeTabColor : inactiveTabColor,
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              textTransform: 'uppercase',
              fontSize: 12,
              letterSpacing: 1,
            }}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMuseumPlacard = (context: string | AncientContext | EtymologyJewel) => {
    let author = "Unknown Source";
    let greek = "Greek text unavailable";
    let translation = "Translation unavailable";
    let citations: string[] = [];

    if (typeof context === 'object' && context !== null) {
        author = context.author || author;
        greek = context.greek || greek;
        translation = context.translation || translation;

        // Check for citations if it's EtymologyJewel (or has citations property)
        if ('citations' in context && Array.isArray(context.citations)) {
            citations = context.citations;
        }
    } else if (context) {
        author = "Context";
        translation = context; // Fallback
    }

    return (
        <View className="p-6 bg-[#f4f1ea] rounded-xl border border-gray-300 shadow-sm mt-2">
            {/* Author / Citation */}
            <Text className="text-xs font-bold text-[#C0A062] uppercase mb-4 tracking-widest text-center" style={{ fontFamily: 'NeueHaasGrotesk-Display' }}>
              {author}
            </Text>

            {/* Greek Text */}
            <Text className="text-2xl font-serif text-[#5D4037] text-center leading-8 mb-4 font-greek" style={{ fontFamily: 'GFSDidot' }}>
              {greek}
            </Text>

            {/* Separator */}
            <View className="h-[1px] bg-gray-300 w-1/3 self-center mb-4" />

            {/* Translation */}
            <Text className="text-lg italic text-gray-500 font-serif text-center leading-6">
              {translation}
            </Text>

            {/* Citations Section */}
            {citations.length > 0 && (
                <View className="mt-4 pt-4 border-t border-gray-300 w-full">
                    <Text className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest text-center" style={{ fontFamily: 'NeueHaasGrotesk-Display' }}>
                        Citations
                    </Text>
                    {citations.map((cite, index) => (
                        <Text key={index} className="text-xs text-gray-500 text-center mb-1 font-ui italic">
                            {cite}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
  };

  const renderContent = () => {
    if (!token) return null;

    switch (activeTab) {
      case 'grammar':
        return (
          <View className="flex-1 gap-4 pb-10">
             {/* Header: The Word + Audio */}
             <View className="flex-row items-center justify-between">
              <Text className="text-4xl font-bold text-white mb-1 flex-1 font-greek" style={{ fontFamily: 'GFSDidot' }}>
                {token.text}
              </Text>
              <IconButton
                 icon="volume-high"
                 iconColor="#C0A062"
                 size={28}
                 onPress={() => AudioPlayer.playSentence(token.text)}
              />
            </View>

            {/* Badges */}
            <View className="flex-row flex-wrap">
              {token.pos && renderBadge(token.pos)}
              {token.tag && token.tag.split('|').filter(t => t !== '_').map((t, i) => (
                renderBadge(t, true)
              ))}
            </View>

             {/* Section A: The Rule (Static - Knot Definition) */}
             {token.knot_definition ? (
               <View className="mb-2 bg-gray-900/30 p-3 rounded-lg border border-gray-800">
                 <Text className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest" style={{ fontFamily: 'NeueHaasGrotesk-Display' }}>The Rule</Text>
                 <Text className="text-sm text-[#9CA3AE] font-serif italic leading-5">
                   {token.knot_definition}
                 </Text>
               </View>
             ) : null}

             {/* Section B: The Logic (Dynamic - Knot Context) */}
             {token.knot_context ? (
               <View className="mb-2 bg-gray-900/30 p-3 rounded-lg border border-gray-800">
                 <Text className="text-[10px] font-bold text-[#C5A059] uppercase mb-1 tracking-widest" style={{ fontFamily: 'NeueHaasGrotesk-Display' }}>The Logic</Text>
                 <Text className="text-sm text-[#C5A059] font-sans leading-5">
                   {token.knot_context}
                 </Text>
               </View>
             ) : null}

            {/* The Morphology */}
            {token.morphology ? (
               <View className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                 <Text className="text-[10px] font-bold text-gray-400 uppercase mb-1" style={{ fontFamily: 'NeueHaasGrotesk-Display' }}>Morphology</Text>
                 <Text className="text-sm text-gray-300 leading-5">{token.morphology}</Text>
               </View>
             ) : null}

            {/* The Lemma */}
            <View className="flex-row items-center justify-between bg-gray-800/30 p-3 rounded-lg border border-gray-800">
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'NeueHaasGrotesk-Display' }}>
                  Lemma
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-lg font-medium text-white font-serif italic mr-2 font-greek" style={{ fontFamily: 'GFSDidot' }}>
                    {token.lemma}
                  </Text>
                  <IconButton
                    icon="volume-high"
                    iconColor="#C0A062"
                    size={20}
                    onPress={() => AudioPlayer.playSentence(token.lemma)}
                    style={{ margin: 0 }}
                  />
                </View>
            </View>

            {/* Paradigm Grid */}
            <View className="mt-2">
              <Text className="text-xs font-bold text-[#C5A059] uppercase mb-2 tracking-widest" style={{ fontFamily: 'NeueHaasGrotesk-Display' }}>Paradigm</Text>
              {token.has_paradigm && token.paradigm ? (
                <ParadigmGrid
                  paradigm={token.paradigm}
                  highlightForm={token.text}
                  pos={token.pos}
                />
              ) : (
                <View className="p-4 items-center justify-center bg-gray-800/30 rounded-xl border border-gray-700">
                  <Text className="text-gray-400 italic">No paradigm available.</Text>
                </View>
              )}
            </View>
          </View>
        );

      case 'context':
        return (
          <View className="mt-2 gap-4 pb-10">
             {/* Definition Section */}
             {token.definition && (
               <View className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest" style={{ fontFamily: 'NeueHaasGrotesk-Display' }}>
                    Definition
                  </Text>
                  <Text className="text-lg text-gray-200 font-serif leading-6">
                    {token.definition}
                  </Text>
               </View>
             )}

            {/* Ancient Context "Eureka" Card (Museum Placard Style) */}
            {(token.etymology_json || token.ancient_context) ? renderMuseumPlacard(token.etymology_json || token.ancient_context!) : (
                <View className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                    <Text className="text-gray-400 italic">No ancient context available.</Text>
                </View>
            )}
          </View>
        );

      case 'family':
        return (
          <View className="mt-2 pb-10">
             <View className="p-6 bg-gray-800/30 rounded-xl border border-gray-700 items-center">
               <Text className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest" style={{ fontFamily: 'NeueHaasGrotesk-Display' }}>
                  Related Forms
               </Text>
               <Text className="text-gray-400 italic text-center mb-2">
                  Family relations for <Text className="text-[#C5A059] font-bold">{token.text}</Text>
               </Text>
               <Text className="text-gray-500 text-xs text-center">
                  (Etymological data and cognates are not yet charted in the stars)
               </Text>
             </View>
          </View>
        );
    }
  };

  if (!token) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1} // Start closed
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundComponent={CustomBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        {renderTabHeader()}
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            {renderContent()}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 5, 24, 0.85)',
  },
  handleIndicator: {
    backgroundColor: '#C5A059',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
