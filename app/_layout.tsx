import { Text, View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'gold', fontSize: 24 }}>THE ENGINE IS ALIVE</Text>
    </View>
  );
}