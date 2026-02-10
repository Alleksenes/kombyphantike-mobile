import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const COSMIC_SHADER = `
uniform vec2 resolution;
uniform float time;

const vec3 C_BASE    = vec3(0.035, 0.035, 0.043); // Deep Void
const vec3 C_MID     = vec3(0.059, 0.090, 0.165); // Slate Cool
const vec3 C_ACCENT  = vec3(0.12, 0.10, 0.22);  // Muted Indigo
const vec3 C_WARM    = vec3(0.10, 0.09, 0.08);  // Stone Warmth

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

vec4 main(vec2 xy) {
    vec2 uv = xy / resolution.xy;
    float aspect = resolution.x / resolution.y;
    vec2 st = uv;
    st.x *= aspect;

    float t = time * 0.05;

    // Soft Mesh movement (Live calculation, no snapshot)
    vec2 p1 = vec2(0.2, 0.3) + vec2(sin(t*0.8), cos(t*0.9)) * 0.2;
    float mask1 = smoothstep(0.8, 0.0, length(st - p1));

    vec2 p2 = vec2(0.8 * aspect, 0.7) + vec2(cos(t*0.7), sin(t*0.6)) * 0.25;
    float mask2 = smoothstep(0.9, 0.0, length(st - p2));

    vec2 p3 = vec2(0.5 * aspect, 0.5) + vec2(sin(t*0.5), cos(t*0.4)) * 0.4;
    float mask3 = smoothstep(1.2, 0.0, length(st - p3));

    vec3 color = mix(C_BASE, C_MID, mask1 * 0.6);
    color = mix(color, C_WARM, mask2 * 0.5);
    color = mix(color, C_ACCENT, mask3 * 0.4);

    // Anti-banding Dither
    color += (random(uv + t) - 0.5) * 0.015;

    // Subtle Vignette
    float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y) * 15.0;
    color *= mix(0.8, 1.0, pow(vig, 0.2));

    return vec4(color, 1.0);
}
`;

const EncoreBackground = () => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);

  useEffect(() => {
    // Geological speed breathing
    time.value = withRepeat(
      withTiming(100, { duration: 100000, easing: Easing.linear }),
      -1
    );
  }, []);

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: time.value,
  }));

  const shader = useMemo(() => {
    if (Platform.OS === 'web') return null;
    return Skia.RuntimeEffect.Make(COSMIC_SHADER);
  }, []);

  if (Platform.OS === 'web') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#030303' }]} />;
  }

  if (!shader) return null;

  return (
    <Canvas style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height}>
        <Shader source={shader} uniforms={uniforms} />
      </Rect>
    </Canvas>
  );
};

export default EncoreBackground;