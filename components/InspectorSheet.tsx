import React, { useMemo, forwardRef } from 'react';
import { View, Text } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Token } from './WordChip';

interface InspectorSheetProps {
  selectedToken: Token | null;
  ancientContext: string;
}

const InspectorSheet = forwardRef<BottomSheet, InspectorSheetProps>(
  ({ selectedToken, ancientContext }, ref) => {
    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => ['45%', '70%'], []);

    // Helper to render a badge
    const renderBadge = (label: string, isMorph: boolean = false) => (
      <View className={`px-2 py-1 rounded mr-2 ${isMorph ? 'bg-orange-100' : 'bg-gray-200'}`}>
        <Text className={`text-xs uppercase font-bold ${isMorph ? 'text-orange-800' : 'text-gray-600'}`}>
          {label}
        </Text>
      </View>
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1} // Closed by default
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: '#F8F5F2' }} // bg-paper
        handleIndicatorStyle={{ backgroundColor: '#5D4037' }} // ancient color
      >
        <BottomSheetView className="flex-1 px-6 pt-2 pb-6">
          {selectedToken ? (
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
                {/* Parse morphological tags if available (assuming tag string like "N-G-P") */}
                {selectedToken.tag && selectedToken.tag.split('-').map((t, i) => (
                  <View key={i}>{renderBadge(t, true)}</View>
                ))}
              </View>

              {/* Row 2: The Soul (Lemma) */}
              <View className="flex-row items-center border-t border-gray-200 pt-4 mt-2">
                <Text className="text-sm font-bold text-gray-500 uppercase mr-2 tracking-wider">
                  Lemma
                </Text>
                <Text className="text-2xl font-medium text-ancient font-serif">
                  {selectedToken.lemma}
                </Text>
              </View>

              {/* Row 3: The Context */}
              <View className="mt-4 p-4 bg-yellow-50/50 rounded-xl border border-yellow-100/50">
                <Text className="text-xs font-bold text-gold uppercase mb-2 tracking-widest">
                  Context
                </Text>
                <Text className="text-lg text-ancient italic font-serif leading-7">
                  {ancientContext}
                </Text>
              </View>

              {/* Row 4: Paradigm (If Available) */}
              {selectedToken.has_paradigm && selectedToken.paradigm && (
                <View className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#2C2C2C' }}>
                  <Text className="text-xs font-bold text-[#F8F5F2] uppercase mb-4 tracking-widest">
                    Paradigm
                  </Text>
                  <View>
                    {selectedToken.paradigm.map((entry, idx) => {
                      const isMatch = entry.form === selectedToken.text;
                      return (
                        <View key={idx} className="flex-row justify-between mb-2 pb-2 border-b border-gray-700 last:border-0 last:mb-0 last:pb-0">
                          <Text
                            className={`text-base ${isMatch ? 'font-bold text-[#C5A059]' : 'text-[#F8F5F2]'}`}
                          >
                            {entry.form}
                          </Text>
                          <Text className="text-sm text-gray-400">
                            {entry.tags}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
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
