import React from "react";
import { ScrollView, Text, View } from "react-native";
import { PhilologicalColors } from "../src/theme";

export class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, backgroundColor: PhilologicalColors.VOID, padding: 40, justifyContent: 'center' }}>
                    <Text style={{ color: 'red', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>FATAL RENDER CRASH</Text>
                    <ScrollView>
                        <Text style={{ color: 'white', fontFamily: 'Courier', fontSize: 12 }}>
                            {this.state.error?.toString()}
                        </Text>
                        <Text style={{ color: 'gray', fontFamily: 'Courier', fontSize: 10, marginTop: 20 }}>
                            {this.state.error?.stack}
                        </Text>
                    </ScrollView>
                </View>
            );
        }
        return this.props.children;
    }
}