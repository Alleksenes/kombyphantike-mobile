import React, { useMemo, forwardRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Token } from './WordChip';
import ParadigmGrid from './ParadigmGrid';

interface InspectorSheetProps {
  selectedToken: Token | null;
  ancientContext: string;
  knotContext?: string;
}

type TabType = 'grammar' | 'context' | 'family';

const InspectorSheet = forwardRef<BottomSheet, InspectorSheetProps>(
  ({ selectedToken, ancientContext, knotContext }, ref) => {
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
               {/* The Knot (Rule Explanation) - Top Priority in Gold */}
               {knotContext ? (
                 <View className="mb-2 p-3 bg-yellow-900/10 border border-yellow-900/30 rounded-xl">
                   <Text className="text-xs font-bold text-gold uppercase mb-1 tracking-widest">The Knot</Text>
                   <Text className="text-lg text-gold font-serif italic leading-6">
                     {knotContext}
                   </Text>
                 </View>
               ) : null}

               {/* Header: The Word */}
               <View>
                <Text className="text-4xl font-bold text-ink mb-1">
                  {selectedToken.text}
                </Text>
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
              <View className="flex-row items-center border-t border-gray-800 pt-4 mt-2">
                <Text className="text-sm font-bold text-gray-500 uppercase mr-2 tracking-wider">
                  From:
                </Text>
                <Text className="text-xl font-medium text-ancient font-serif italic">
                  {selectedToken.lemma}
                </Text>
              </View>
            </View>
          );
        case 'context':
          return (
            <View className="mt-4 gap-4">
               {/* Definition Section */}
               {selectedToken.definition && (
                 <View className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                    <Text className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">
                      Definition
                    </Text>
                    <Text className="text-lg text-ink font-serif leading-6">
                      {selectedToken.definition}
                    </Text>
                 </View>
               )}

              {/* Ancient Context Section */}
              <View className="p-4 bg-yellow-900/20 rounded-xl border border-yellow-700/30">
                <Text className="text-xs font-bold text-gold uppercase mb-2 tracking-widest">
                  Ancient Context
                </Text>
                <Text className="text-lg text-ancient italic font-serif leading-7">
                  {selectedToken.ancient_context || ancientContext || "No citation available."}
                </Text>
              </View>
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
