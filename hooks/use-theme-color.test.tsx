import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useThemeColor } from './use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

// Test component to wrap the hook for testing
const TestComponent = ({
  hookProps,
  colorName,
  onResult
}: {
  hookProps: { light?: string; dark?: string };
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark;
  onResult: (color: string) => void;
}) => {
  const result = useThemeColor(hookProps, colorName);
  onResult(result);
  return null;
};

describe('useThemeColor', () => {
  const mockUseColorScheme = useColorScheme as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderHookAndGetResult = (
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light & keyof typeof Colors.dark
  ) => {
    let result: string | undefined;
    act(() => {
      renderer.create(
        <TestComponent
          hookProps={props}
          colorName={colorName}
          onResult={(res) => { result = res; }}
        />
      );
    });
    return result;
  };

  it('returns light color when theme is light and no override provided', () => {
    mockUseColorScheme.mockReturnValue('light');
    const color = renderHookAndGetResult({}, 'text');
    expect(color).toBe(Colors.light.text);
  });

  it('returns dark color when theme is dark and no override provided', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const color = renderHookAndGetResult({}, 'text');
    expect(color).toBe(Colors.dark.text);
  });

  it('returns light override when theme is light and override provided', () => {
    mockUseColorScheme.mockReturnValue('light');
    const color = renderHookAndGetResult({ light: 'red' }, 'text');
    expect(color).toBe('red');
  });

  it('returns dark override when theme is dark and override provided', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const color = renderHookAndGetResult({ dark: 'blue' }, 'text');
    expect(color).toBe('blue');
  });

  it('defaults to light color when theme is null/undefined', () => {
    mockUseColorScheme.mockReturnValue(null);
    const color = renderHookAndGetResult({}, 'text');
    expect(color).toBe(Colors.light.text);
  });
});
