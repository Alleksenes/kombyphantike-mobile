import React, { useMemo, forwardRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Token } from './WordChip';
import ParadigmGrid from './ParadigmGrid';
import { AudioPlayer } from '../src/services/AudioPlayer';

interface InspectorSheetProps {
  selectedToken: Token | null;
  ancientContext: string;
  greekSentence?: string;
  englishTranslation?: string;
}

type TabType = 'grammar' | 'context' | 'family';

const InspectorSheet = forwardRef<BottomSheet, InspectorSheetProps>(
  ({ selectedToken, ancientContext, greekSentence, englishTranslation }, ref) => {
    // We assume dark mode is forced
    const [activeTab, setActiveTab] = useState<TabType>('grammar');

    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => ['45%', '70%'], []);

    // Helper to render a badge
    const renderBadge = (label: string, isMorph: boolean = false) => (
      <View className={`px-2 py-1 rounded mr-2 ${isMorph ? 'bg-orange-900/40 border border-orange-800' : 'bg-gray-800 border border-gray-700'}`}>
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

    const renderContent = () => {
      if (!selectedToken) return null;

      switch (activeTab) {
        case 'grammar':
          return (
            <View className="flex-1 gap-4">
               {/* Section A: The Rule (Static - Knot Definition) */}
               {selectedToken.knot_definition ? (
                 <View className="mb-2">
                   <Text className="text-xs font-bold text-gray-500 uppercase mb-1 tracking-widest">The Rule</Text>
                   <Text className="text-base text-[#9CA3AE] font-serif italic leading-6">
                     {selectedToken.knot_definition}
                   </Text>
                 </View>
               ) : null}

               {/* Divider */}
               {selectedToken.knot_definition && selectedToken.knot_context ? (
                   <View className="h-[1px] bg-gray-800 my-2" />
               ) : null}

               {/* Section B: The Logic (Dynamic - Knot Context) */}
               {selectedToken.knot_context ? (
                 <View className="mb-2">
                   <Text className="text-xs font-bold text-accent uppercase mb-1 tracking-widest">The Logic</Text>
                   <Text className="text-lg text-[#C5A059] font-sans leading-6">
                     {selectedToken.knot_context}
                   </Text>
                 </View>
               ) : null}

               {/* Header: The Word + Audio */}
               <View className="flex-row items-center justify-between mt-4 border-t border-gray-800 pt-4">
                <Text className="text-4xl font-bold text-text mb-1 flex-1">
                  {selectedToken.text}
                </Text>
                <IconButton
                   icon="volume-high"
                   iconColor="#C0A062"
                   size={28}
                   onPress={() => AudioPlayer.playSentence(selectedToken.text)}
                />
              </View>

              {/* Row 1: Badges */}
              <View className="flex-row flex-wrap">
                {selectedToken.pos && renderBadge(selectedToken.pos)}
                {/* Parse morphological tags if available */}
                {selectedToken.tag && selectedToken.tag.split('-').map((t, i) => (
                  <View key={i}>{renderBadge(t, true)}</View>
                ))}
              </View>

              {/* The Morphology */}
              {selectedToken.morphology ? (
                 <View className="p-3 bg-gray-800/50 rounded-lg mt-2 border border-gray-700">
                   <Text className="text-xs font-bold text-gray-400 uppercase mb-1">Morphology</Text>
                   <Text className="text-sm text-gray-300 leading-5">{selectedToken.morphology}</Text>
                 </View>
               ) : null}

              {/* The Lemma */}
              <View className="flex-row items-center pt-2 justify-between">
                <View className="flex-row items-center">
                  <Text className="text-sm font-bold text-gray-500 uppercase mr-2 tracking-wider">
                    From:
                  </Text>
                  <Text className="text-xl font-medium text-ancient font-serif italic">
                    {selectedToken.lemma}
                  </Text>
                </View>
                <IconButton
                   icon="volume-high"
                   iconColor="#C0A062"
                   size={24}
                   onPress={() => AudioPlayer.playSentence(selectedToken.lemma)}
                />
              </View>
            </View>
          );
        case 'context':
          return (
            <View className="mt-4 gap-4">
               {/* Definition Section */}
               {selectedToken.definition && (
                 <View className="p-4 bg-gray-800/30 rounded-xl border border-gray-700 mb-2">
                    <Text className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">
                      Definition
                    </Text>
                    <Text className="text-lg text-text font-serif leading-6">
                      {selectedToken.definition}
                    </Text>
                 </View>
               )}

              {/* Ancient Context "Eureka" Card (Museum Placard Style) */}
              <View className="p-6 bg-[#f4f1ea] rounded-xl border border-gray-300 shadow-sm">
                {/* Author / Citation */}
                <Text className="text-xs font-bold text-[#C0A062] uppercase mb-4 tracking-widest text-center">
                  {ancientContext || "Unknown Source"}
                </Text>

                {/* Greek Text */}
                <Text className="text-2xl font-serif text-[#5D4037] text-center leading-8 mb-4">
                  {greekSentence || "Greek text unavailable"}
                </Text>

                {/* Separator */}
                <View className="h-[1px] bg-gray-300 w-1/3 self-center mb-4" />

                {/* Translation */}
                <Text className="text-lg italic text-gray-500 font-serif text-center leading-6">
                  {englishTranslation || "Translation unavailable"}
                </Text>
              </View>

              {/* Optional: Token specific context/note if different from main citation */}
              {selectedToken.ancient_context && selectedToken.ancient_context !== ancientContext && (
                 <View className="mt-2 px-4">
                    <Text className="text-xs text-gray-600 italic">
                       Note: {selectedToken.ancient_context}
                    </Text>
                 </View>
              )}
            </View>
          );
        case 'family':
          return (
            <View className="mt-2">
              {selectedToken.has_paradigm && selectedToken.paradigm ? (
                <ParadigmGrid
                  paradigm={selectedToken.paradigm}
                  highlightForm={selectedToken.text}
                  pos={selectedToken.pos}
                />
              ) : (
                <View className="p-4 items-center justify-center">
                  <Text className="text-gray-400 italic">No paradigm available for this word.</Text>
                </View>
              )}
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
              <View className="flex-1">
                {renderContent()}
              </View>
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
