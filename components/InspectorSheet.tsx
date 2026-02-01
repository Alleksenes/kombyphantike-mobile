import React, { useMemo, forwardRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Token } from './WordChip';
import ParadigmGrid from './ParadigmGrid';

interface InspectorSheetProps {
  selectedToken: Token | null;
  ancientContext: string;
}

type TabType = 'grammar' | 'context' | 'family';

const InspectorSheet = forwardRef<BottomSheet, InspectorSheetProps>(
  ({ selectedToken, ancientContext }, ref) => {
    const { colorScheme } = useColorScheme();
    const [activeTab, setActiveTab] = useState<TabType>('grammar');

    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => ['45%', '70%'], []);

    // Helper to render a badge
    const renderBadge = (label: string, isMorph: boolean = false) => (
      <View className={`px-2 py-1 rounded mr-2 ${isMorph ? 'bg-orange-100 dark:bg-orange-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <Text className={`text-xs uppercase font-bold ${isMorph ? 'text-orange-800 dark:text-orange-200' : 'text-gray-600 dark:text-gray-300'}`}>
          {label}
        </Text>
      </View>
    );

    const bgPaper = colorScheme === 'dark' ? '#232226' : '#F8F5F2';
    const indicatorColor = colorScheme === 'dark' ? '#B39DDB' : '#5D4037';
    const activeTabColor = colorScheme === 'dark' ? '#B39DDB' : '#5D4037';
    const inactiveTabColor = colorScheme === 'dark' ? '#555' : '#999';

    const renderTabHeader = () => (
      <View className="flex-row border-b border-gray-200 dark:border-gray-700 mb-4">
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

              {/* Row 2: The Soul (Lemma) */}
              <View className="flex-row items-center border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <Text className="text-sm font-bold text-gray-500 uppercase mr-2 tracking-wider">
                  Lemma
                </Text>
                <Text className="text-2xl font-medium text-ancient font-serif">
                  {selectedToken.lemma}
                </Text>
              </View>
            </View>
          );
        case 'context':
          return (
            <View className="mt-4 p-4 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100/50 dark:border-yellow-700/30">
              <Text className="text-xs font-bold text-gold uppercase mb-2 tracking-widest">
                Ancient Context
              </Text>
              <Text className="text-lg text-ancient italic font-serif leading-7">
                {ancientContext || "No citation available."}
              </Text>
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
