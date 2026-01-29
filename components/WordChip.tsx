import React from 'react';
import { Text, Pressable } from 'react-native';

interface WordChipProps {
  text: string;
  pos?: string;
  isHero?: boolean;
  onPress?: () => void;
}

export default function WordChip({ text, pos, isHero, onPress }: WordChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-2 py-1 m-1 rounded-md bg-white border border-gray-200 ${isHero ? 'border-gold bg-yellow-50' : ''}`}
    >
      <Text className="text-ink text-base font-normal">{text}</Text>
    </Pressable>
  );
}
