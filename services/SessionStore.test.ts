import { SessionStore } from './SessionStore';

describe('SessionStore', () => {
  beforeEach(() => {
    SessionStore.clear();
  });

  it('should initialize with default values', () => {
    expect(SessionStore.getDraft()).toBeNull();
    expect(SessionStore.getInstructions()).toBe('');
    expect(SessionStore.getTheme()).toBe('');
    expect(SessionStore.isFilled()).toBe(false);
  });

  it('should set and get draft', () => {
    const mockDraft = { id: 1, theme: 'Ancient Greece' };
    SessionStore.setDraft(mockDraft);
    expect(SessionStore.getDraft()).toEqual(mockDraft);
    expect(SessionStore.isFilled()).toBe(false);
  });

  it('should set draft and filled status', () => {
    const mockDraft = { id: 1, theme: 'Ancient Greece' };
    SessionStore.setDraft(mockDraft, true);
    expect(SessionStore.getDraft()).toEqual(mockDraft);
    expect(SessionStore.isFilled()).toBe(true);
  });

  it('should set and get instructions', () => {
    const instructions = 'Test instructions';
    SessionStore.setInstructions(instructions);
    expect(SessionStore.getInstructions()).toBe(instructions);
  });

  it('should set and get theme', () => {
    const theme = 'Dark Mode';
    SessionStore.setTheme(theme);
    expect(SessionStore.getTheme()).toBe(theme);
  });

  it('should clear all values', () => {
    SessionStore.setDraft({ id: 1 }, true);
    SessionStore.setInstructions('test');
    SessionStore.setTheme('dark');

    SessionStore.clear();

    expect(SessionStore.getDraft()).toBeNull();
    expect(SessionStore.getInstructions()).toBe('');
    expect(SessionStore.getTheme()).toBe('');
    expect(SessionStore.isFilled()).toBe(false);
  });
});
