import React, { useMemo, useEffect } from 'react';
import { StyleSheet, useWindowDimensions, Platform, View } from 'react-native';
import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';

const COSMIC_SHADER = `
uniform vec2 resolution;
uniform float time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform vec3 u_color5;
uniform vec3 u_color6;
uniform vec3 u_color7;
uniform vec3 u_color8;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

half4 main(vec2 xy) {
    vec2 st = xy / resolution.xy;
    st.x *= resolution.x/resolution.y;

    // Slow down time - "Geological speed"
    float t = time * 0.05;

    vec2 q = vec2(0.);
    q.x = fbm( st + vec2(0.0) );
    q.y = fbm( st + vec2(5.2, 1.3) );

    vec2 r = vec2(0.);
    r.x = fbm( st + 4.0*q + vec2(1.7,9.2) + 0.15*t );
    r.y = fbm( st + 4.0*q + vec2(8.3,2.8) + 0.126*t );

    float f = fbm( st + 4.0*r );

    vec3 color = mix(u_color1, u_color2, clamp((f*f)*4.0,0.0,1.0));
    color = mix(color, u_color3, clamp(length(q),0.0,1.0));
    color = mix(color, u_color4, clamp(length(r.x),0.0,1.0));

    // Chaotic intertwining of crimson (u_color5) - adding "warmth"
    color = mix(color, u_color5, clamp(length(r.y),0.0,1.0));

    // Bronze (u_color6) - changing audience
    color = mix(color, u_color6, clamp(length(q.x)*0.5, 0.0, 1.0));

    // Byzantine Gold (u_color7) - Leveling up sublimely
    // Applied to high values of noise for highlights
    color = mix(color, u_color7, clamp(pow(f, 3.0), 0.0, 1.0) * 0.5);

    // Womb Purple (u_color8) - "Unholy Mother"
    // Mixing into the shadows/base
    color = mix(color, u_color8, 1.0 - smoothstep(0.0, 0.8, f));

    return half4((f*f*f+0.6*f*f+0.5*f)*color, 1.0);
}
`;

const CosmicBackground = () => {
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
      u_color1: [0.059, 0.020, 0.094], // #0f0518
      u_color2: [0.290, 0.102, 0.369], // #4a1a5e
      u_color3: [0.420, 0.173, 0.569], // #6b2c91
      u_color4: [0.541, 0.169, 0.886], // #8a2be2
      u_color5: [0.243, 0.039, 0.082], // #3e0a15
      u_color6: [0.369, 0.294, 0.082], // #5e4b15
      u_color7: [0.831, 0.686, 0.216], // #d4af37
      u_color8: [0.102, 0.043, 0.180], // #1a0b2e
    };
  }, [width, height]);

  const shader = useMemo(() => {
    if (Platform.OS === 'web') {
       return null;
    }
    return Skia.RuntimeEffect.Make(COSMIC_SHADER);
  }, []);

  if (Platform.OS === 'web') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0f0518' }]} />;
  }

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

export default CosmicBackground;
