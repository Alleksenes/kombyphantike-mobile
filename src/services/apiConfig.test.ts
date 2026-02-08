import { Platform } from 'react-native';

describe('apiConfig', () => {
  const originalEnv = process.env;
  const originalDev = global.__DEV__;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
    global.__DEV__ = originalDev;
  });

  it('uses EXPO_PUBLIC_API_URL if provided in development', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://test-api.com';
    (global as any).__DEV__ = true;
    const { API_BASE_URL } = require('./apiConfig');
    expect(API_BASE_URL).toBe('http://test-api.com');
  });

  it('defaults to localhost in development on non-android', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    (global as any).__DEV__ = true;
    // We can't easily change Platform.OS once react-native is loaded by jest-expo
    // but we can check what it currently is and expect the corresponding value
    const { API_BASE_URL } = require('./apiConfig');
    if (Platform.OS === 'android') {
      expect(API_BASE_URL).toBe('http://10.0.2.2:8000');
    } else {
      expect(API_BASE_URL).toBe('http://localhost:8000');
    }
  });

  it('uses EXPO_PUBLIC_API_URL in production', () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.prod.com';
    (global as any).__DEV__ = false;
    const { API_BASE_URL } = require('./apiConfig');
    expect(API_BASE_URL).toBe('https://api.prod.com');
  });

  it('returns placeholder in production if EXPO_PUBLIC_API_URL is missing', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    (global as any).__DEV__ = false;
    const { API_BASE_URL } = require('./apiConfig');
    expect(API_BASE_URL).toBe('https://api.missing-env-var.error');
  });

  it('warns in production if EXPO_PUBLIC_API_URL uses HTTP', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.prod.com';
    (global as any).__DEV__ = false;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { API_BASE_URL } = require('./apiConfig');
    expect(API_BASE_URL).toBe('http://api.prod.com');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Insecure API URL (HTTP) detected in production'));
    warnSpy.mockRestore();
  });
});
