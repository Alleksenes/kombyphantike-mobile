import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Simple placeholder to pass the build
export default function InspectorSheet({ token, onClose }: { token: any, onClose: () => void }) {
    if (!token) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{token.lemma || "Word"}</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color="#C5A059" />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <Text style={{ color: 'white' }}>Grammar / Context / Family goes here.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: '#1a1918',
        borderTopWidth: 1,
        borderColor: '#C5A059',
        padding: 20,
        zIndex: 200,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: {
        color: '#E3DCCB',
        fontSize: 24,
        fontFamily: 'GFSDidot',
    },
    content: {
        flex: 1,
    }
});