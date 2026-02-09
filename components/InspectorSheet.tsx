import React, { useMemo, forwardRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Token, AncientContext } from './WordChip';
import ParadigmGrid from './ParadigmGrid';
import { AudioPlayer } from '../src/services/AudioPlayer';

interface InspectorSheetProps {
  selectedToken: Token | null;
  ancientContext: string | AncientContext;
  greekSentence?: string;
  englishTranslation?: string;
}

type TabType = 'grammar' | 'context' | 'family';

const InspectorSheet = forwardRef<BottomSheet, InspectorSheetProps>(
  ({ selectedToken, ancientContext, greekSentence, englishTranslation }, ref) => {
    // We assume dark mode is forced
    const [activeTab, setActiveTab] = useState<TabType>('grammar');

    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => ['50%', '85%'], []);

    // Helper to render a badge
    const renderBadge = (label: string, isMorph: boolean = false) => (
      <View className={`px-2 py-1 rounded mr-2 mb-2 ${isMorph ? 'bg-orange-900/40 border border-orange-800' : 'bg-gray-800 border border-gray-700'}`}>
        <Text className={`text-xs uppercase font-bold ${isMorph ? 'text-orange-300' : 'text-gray-400'}`}>
          {label}
        </Text>
      </View>
    );

    const bgPaper = '#252422'; // Card Background
    const indicatorColor = '#C0A062'; // Gold
    const activeTabColor = '#C0A062'; // Gold
    const inactiveTabColor = '#666';

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

    const renderMuseumPlacard = (context: string | AncientContext, fallbackGreek?: string, fallbackTranslation?: string) => {
        let author = "Unknown Source";
        let greek = fallbackGreek || "Greek text unavailable";
        let translation = fallbackTranslation || "Translation unavailable";

        if (typeof context === 'object' && context !== null) {
            author = context.author || author;
            greek = context.greek || greek;
            translation = context.translation || translation;
        } else if (context) {
            author = context;
        }

        return (
            <View className="p-6 bg-[#f4f1ea] rounded-xl border border-gray-300 shadow-sm mt-2">
                {/* Author / Citation */}
                <Text className="text-xs font-bold text-[#C0A062] uppercase mb-4 tracking-widest text-center">
                  {author}
                </Text>

                {/* Greek Text */}
                <Text className="text-2xl font-serif text-[#5D4037] text-center leading-8 mb-4 font-greek">
                  {greek}
                </Text>

                {/* Separator */}
                <View className="h-[1px] bg-gray-300 w-1/3 self-center mb-4" />

                {/* Translation */}
                <Text className="text-lg italic text-gray-500 font-serif text-center leading-6">
                  {translation}
                </Text>
              </View>
        );
    };

    const renderContent = () => {
      if (!selectedToken) return null;

      switch (activeTab) {
        case 'grammar':
          return (
            <View className="flex-1 gap-4 pb-10">
               {/* Header: The Word + Audio */}
               <View className="flex-row items-center justify-between">
                <Text className="text-4xl font-bold text-text mb-1 flex-1 font-greek">
                  {selectedToken.text}
                </Text>
                <IconButton
                   icon="volume-high"
                   iconColor="#C0A062"
                   size={28}
                   onPress={() => AudioPlayer.playSentence(selectedToken.text)}
                />
              </View>

              {/* Badges */}
              <View className="flex-row flex-wrap">
                {selectedToken.pos && renderBadge(selectedToken.pos)}
                {selectedToken.tag && selectedToken.tag.split('-').map((t, i) => (
                  <View key={i}>{renderBadge(t, true)}</View>
                ))}
              </View>

               {/* Section A: The Rule (Static - Knot Definition) */}
               {selectedToken.knot_definition ? (
                 <View className="mb-2 bg-gray-900/30 p-3 rounded-lg border border-gray-800">
                   <Text className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">The Rule</Text>
                   <Text className="text-sm text-[#9CA3AE] font-serif italic leading-5">
                     {selectedToken.knot_definition}
                   </Text>
                 </View>
               ) : null}

               {/* Section B: The Logic (Dynamic - Knot Context) */}
               {selectedToken.knot_context ? (
                 <View className="mb-2 bg-gray-900/30 p-3 rounded-lg border border-gray-800">
                   <Text className="text-[10px] font-bold text-accent uppercase mb-1 tracking-widest">The Logic</Text>
                   <Text className="text-sm text-[#C5A059] font-sans leading-5">
                     {selectedToken.knot_context}
                   </Text>
                 </View>
               ) : null}

              {/* The Morphology */}
              {selectedToken.morphology ? (
                 <View className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                   <Text className="text-[10px] font-bold text-gray-400 uppercase mb-1">Morphology</Text>
                   <Text className="text-sm text-gray-300 leading-5">{selectedToken.morphology}</Text>
                 </View>
               ) : null}

              {/* The Lemma */}
              <View className="flex-row items-center justify-between bg-gray-800/30 p-3 rounded-lg border border-gray-800">
                  <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Lemma
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-lg font-medium text-ancient font-serif italic mr-2 font-greek">
                      {selectedToken.lemma}
                    </Text>
                    <IconButton
                      icon="volume-high"
                      iconColor="#C0A062"
                      size={20}
                      onPress={() => AudioPlayer.playSentence(selectedToken.lemma)}
                      style={{ margin: 0 }}
                    />
                  </View>
              </View>

              {/* Paradigm Grid */}
              <View className="mt-2">
                <Text className="text-xs font-bold text-accent uppercase mb-2 tracking-widest">Paradigm</Text>
                {selectedToken.has_paradigm && selectedToken.paradigm ? (
                  <ParadigmGrid
                    paradigm={selectedToken.paradigm}
                    highlightForm={selectedToken.text}
                    pos={selectedToken.pos}
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
               {selectedToken.definition && (
                 <View className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                    <Text className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">
                      Definition
                    </Text>
                    <Text className="text-lg text-text font-serif leading-6">
                      {selectedToken.definition}
                    </Text>
                 </View>
               )}

              {/* Ancient Context "Eureka" Card (Museum Placard Style) */}
              {renderMuseumPlacard(ancientContext, greekSentence, englishTranslation)}

              {/* Optional: Token specific context/note */}
              {selectedToken.ancient_context && selectedToken.ancient_context !== ancientContext && (
                 <View className="mt-2">
                     <Text className="text-xs text-gray-600 italic px-4 mb-2">Specific Note:</Text>
                     {typeof selectedToken.ancient_context === 'object' ?
                        renderMuseumPlacard(selectedToken.ancient_context) :
                        <View className="px-4"><Text className="text-xs text-gray-600 italic">Note: {selectedToken.ancient_context}</Text></View>
                     }
                 </View>
              )}
            </View>
          );

        case 'family':
          return (
            <View className="mt-2 pb-10">
               <View className="p-6 bg-gray-800/30 rounded-xl border border-gray-700 items-center">
                 <Text className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">
                    Related Forms
                 </Text>
                 <Text className="text-gray-400 italic text-center mb-2">
                    Family relations for <Text className="text-accent font-bold">{selectedToken.text}</Text>
                 </Text>
                 <Text className="text-gray-500 text-xs text-center">
                    (Etymological data and cognates are not yet charted in the stars)
                 </Text>
               </View>
            </View>
          );
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1} // Closed by default
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: bgPaper }}
        handleIndicatorStyle={{ backgroundColor: indicatorColor }}
      >
        <BottomSheetView className="flex-1 px-6 pt-2 pb-6">
          {selectedToken ? (
            <>
              {renderTabHeader()}
              <BottomSheetScrollView showsVerticalScrollIndicator={false}>
                {renderContent()}
              </BottomSheetScrollView>
            </>
          ) : (
             <View className="flex-1 justify-center items-center">
                <Text className="text-gray-400">Select a word to inspect</Text>
             </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

InspectorSheet.displayName = 'InspectorSheet';

export default InspectorSheet;
