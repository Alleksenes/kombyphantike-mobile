import { useThemeColor } from './use-theme-color';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns light theme color when scheme is light', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const color = useThemeColor({}, 'text');
    expect(color).toBe(Colors.light.text);
  });

  it('returns dark theme color when scheme is dark', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    const color = useThemeColor({}, 'text');
    expect(color).toBe(Colors.dark.text);
  });

  it('returns prop color for light mode', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const color = useThemeColor({ light: '#123456' }, 'text');
    expect(color).toBe('#123456');
  });

  it('returns prop color for dark mode', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    const color = useThemeColor({ dark: '#654321' }, 'text');
    expect(color).toBe('#654321');
  });

  it('falls back to light mode when scheme is null/undefined', () => {
    (useColorScheme as jest.Mock).mockReturnValue(null);
    const color = useThemeColor({}, 'text');
    expect(color).toBe(Colors.light.text);
  });
});
