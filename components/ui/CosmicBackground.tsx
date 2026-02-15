import React, { useMemo, useEffect } from 'react';
import { StyleSheet, useWindowDimensions, Platform, View } from 'react-native';
import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';

// THE ENCORE CHROMATIC SHADER
// Adapted from the Obsidian Theme SCSS to GLSL
const COSMIC_SHADER = `
uniform vec2 resolution;
uniform float time;

// The Encore Palette
const vec3 c_cyan   = vec3(0.059, 0.961, 0.996);
const vec3 c_purple = vec3(0.435, 0.000, 1.000);
const vec3 c_red    = vec3(1.000, 0.000, 0.000);
const vec3 c_yellow = vec3(1.000, 0.871, 0.000);
const vec3 c_lime   = vec3(0.655, 1.000, 0.000);

// Smooth Noise Function
float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 4; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0;
        a *= 0.5;
    }
    return v;
}

vec4 main(vec2 xy) {
    vec2 st = xy / resolution.xy;
    st.x *= resolution.x/resolution.y;

    // Diagonal movement (like 45deg linear gradient)
    float t = time * 0.05;
    vec2 flow = vec2(st.x + st.y + t);

    // Warp the domain to make it "Liquid" instead of static stripes
    float n = fbm(st * 3.0 - t * 0.2);

    // Mix the palette based on the flow and noise
    vec3 color = mix(c_cyan, c_purple, sin(flow.x * 3.0 + n) * 0.5 + 0.5);
    color = mix(color, c_red, sin(flow.x * 2.0 + n * 2.0 + 2.0) * 0.5 + 0.5);
    color = mix(color, c_yellow, sin(flow.x * 4.0 - n + 4.0) * 0.5 + 0.5);

    // Add the "Grain" (The Obsidian texture)
    float grain = random(st * time) * 0.08;

    // Darken it slightly to keep text readable (Obsidian mode)
    color = color * 0.6 + vec3(grain);

    return vec4(color, 1.0);
}
`;

const CosmicBackground = () => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);

  useEffect(() => {
    // Slower, infinite loop for the "Scroll" effect
    time.value = withRepeat(withTiming(1000, { duration: 100000, easing: Easing.linear }), -1);
  }, [time]);

  const uniforms = useDerivedValue(() => ({ resolution: [width, height], time: time.value }));

  // WEB FALLBACK: If on web, return null (handled by CSS in root)
  const shader = useMemo(() => (Platform.OS === 'web' ? null : Skia.RuntimeEffect.Make(COSMIC_SHADER)), []);

  if (Platform.OS === 'web' || !shader) {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1918' }]} />;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={{ flex: 1 }}>
        <Rect x={0} y={0} width={width} height={height}>
          <Shader source={shader} uniforms={uniforms} />
        </Rect>
      </Canvas>
    </View>
  );
};

export default CosmicBackground;
