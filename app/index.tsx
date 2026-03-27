import { View, Text, StyleSheet } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HELLO WORLD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1918',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
