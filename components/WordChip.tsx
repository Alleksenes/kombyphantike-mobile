import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

export interface Token {
  text: string;
  has_paradigm?: boolean;
  knot_relevant?: boolean;
  [key: string]: any;
}

interface WordChipProps {
  token: Token;
  onPress: (token: Token) => void;
}

export default function WordChip({ token, onPress }: WordChipProps) {
  const theme = useTheme();
  const isRelevant = token.has_paradigm || token.knot_relevant;

  return (
    <TouchableRipple
      onPress={() => onPress(token)}
      style={[
        styles.chip,
        isRelevant && {
            borderBottomColor: theme.colors.primary,
            borderBottomWidth: 3 // Subtle underline/hint
        }
      ]}
      borderless
    >
      <Text
        variant="displaySmall"
        style={[
            styles.text,
            { color: theme.colors.primary } // Keep primary color as in PhilologyCard
        ]}
      >
        {token.text}
      </Text>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  chip: {
    marginRight: 6,
    marginBottom: 4,
    borderRadius: 2,
    paddingHorizontal: 2,
  },
  text: {
      fontWeight: '800',
      letterSpacing: -0.5,
      // We don't set lineHeight here to avoid clipping with the border, or we ensure container handles it.
  }
});
