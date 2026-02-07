import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// Embed the shader code directly to avoid runtime loading issues
const OBSIDIAN_VOID_SHADER = `
uniform float2 resolution;
uniform float time;

float noise(float2 co) {
    return fract(sin(dot(co.xy, float2(12.9898, 78.233))) * 43758.5453);
}

half4 main(float2 xy) {
    float2 uv = xy / resolution;

    // Gradient: #1a0b2e (26, 11, 46) to #0f0518 (15, 5, 24)
    float3 color1 = float3(0.102, 0.043, 0.180);
    float3 color2 = float3(0.059, 0.020, 0.094);

    float dist = distance(uv, float2(0.5, 0.5));
    float3 color = mix(color1, color2, dist * 1.5);

    // Vignette
    float vignette = smoothstep(1.5, 0.2, dist);
    color *= vignette;

    // Noise
    float n = noise(uv * time);
    color += n * 0.02;

    return half4(color, 1.0);
}
`;

const Atmosphere = () => {
    const { width, height } = useWindowDimensions();
    const time = useSharedValue(0);

    useEffect(() => {
        time.value = withRepeat(
            withTiming(100, { duration: 100000, easing: Easing.linear }),
            -1
        );
    }, [time]);

    const uniforms = useDerivedValue(() => {
        return {
            resolution: [width, height],
            time: time.value,
        };
    }, [width, height]);

    const shader = useMemo(() => {
        if (Platform.OS === 'web') {
            // On Web, Skia requires async WASM loading (WithSkiaWeb).
            // For this prototype, we skip rendering the shader on Web to prevent crashes if not loaded.
            return null;
        }
        if (Skia && Skia.RuntimeEffect) {
            return Skia.RuntimeEffect.Make(OBSIDIAN_VOID_SHADER);
        }
        return null;
    }, []);

    if (!shader) {
        return null;
    }

    return (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Rect x={0} y={0} width={width} height={height}>
                <Shader source={shader} uniforms={uniforms} />
            </Rect>
        </Canvas>
    );
};

export default Atmosphere;