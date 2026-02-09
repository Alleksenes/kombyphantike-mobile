import Slider from '@react-native-community/slider';
import { Pressable, Switch, Text, View } from 'react-native';

interface WeaverControlsProps {
    sentenceCount: number;
    setSentenceCount: (count: number) => void;
    cefLevel: string;
    setCefLevel: (level: string) => void;
    complexity: boolean;
    setComplexity: (complex: boolean) => void;
}

const CEFR_LEVELS = ['Any', 'A1-A2', 'B1-B2', 'C1-C2'];

export default function WeaverControls({
    sentenceCount,
    setSentenceCount,
    cefLevel,
    setCefLevel,
    complexity,
    setComplexity,
}: WeaverControlsProps) {
    return (
        <View className="w-full mb-6">
            {/* Container: Obsidian Card with Gold Border */}
            <View className="bg-card border border-accent rounded-xl p-5 shadow-lg">

                {/* Header */}
                <Text className="text-accent font-display text-lg mb-4 tracking-wider text-center uppercase">
                    Stele of Command
                </Text>

                {/* Dial of Scope: Slider */}
                <View className="mb-6">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-text font-ui text-sm">Scope</Text>
                        <Text className="text-accent font-ui font-bold">{sentenceCount} Sentences</Text>
                    </View>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={5}
                        maximumValue={20}
                        step={1}
                        value={sentenceCount}
                        onValueChange={setSentenceCount}
                        minimumTrackTintColor="#C0A062"
                        maximumTrackTintColor="#1a1918"
                        thumbTintColor="#C0A062"
                    />
                </View>

                {/* Dial of Level: Segmented Control */}
                <View className="mb-6">
                    <Text className="text-text font-ui text-sm mb-3">Proficiency Level</Text>
                    <View className="flex-row rounded-lg overflow-hidden border border-accent/30 bg-[#1a1918]">
                        {CEFR_LEVELS.map((level, index) => {
                            const isActive = cefLevel === level;
                            return (
                                <Pressable
                                    key={level}
                                    onPress={() => setCefLevel(level)}
                                    className={`flex-1 py-3 items-center justify-center ${isActive ? 'bg-accent' : 'bg-transparent'
                                        } ${index !== CEFR_LEVELS.length - 1 ? 'border-r border-accent/30' : ''}`}
                                >
                                    <Text
                                        className={`font-ui text-xs font-bold ${isActive ? 'text-[#1a1918]' : 'text-text/70'
                                            }`}
                                    >
                                        {level}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Dial of Complexity: Toggle */}
                <View className="flex-row justify-between items-center pt-2 border-t border-accent/20">
                    <View>
                        <Text className="text-text font-ui text-sm">Complexity</Text>
                        <Text className="text-accent font-ui text-xs mt-1">
                            {complexity ? 'Complex Structures' : 'Lucid Clarity'}
                        </Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#1a1918', true: '#C0A062' }}
                        thumbColor={complexity ? '#FFFFFF' : '#C0A062'}
                        ios_backgroundColor="#1a1918"
                        onValueChange={setComplexity}
                        value={complexity}
                    />
                </View>

            </View>
        </View>
    );
}