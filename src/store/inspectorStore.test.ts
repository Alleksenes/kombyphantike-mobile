import { useInspectorStore } from './inspectorStore';
import { Token } from '../../components/WordChip';

describe('useInspectorStore', () => {
  const mockToken: Token = {
    text: 'test',
    lemma: 'test',
    pos: 'NOUN',
  };

  beforeEach(() => {
    useInspectorStore.setState({ token: null, isOpen: false });
  });

  it('should initialize with default values', () => {
    const state = useInspectorStore.getState();
    expect(state.token).toBeNull();
    expect(state.isOpen).toBe(false);
  });

  it('should open inspector with a token', () => {
    const { openInspector } = useInspectorStore.getState();
    openInspector(mockToken);

    const state = useInspectorStore.getState();
    expect(state.token).toEqual(mockToken);
    expect(state.isOpen).toBe(true);
  });

  it('should close inspector but keep the token', () => {
    const { openInspector, closeInspector } = useInspectorStore.getState();
    openInspector(mockToken);
    closeInspector();

    const state = useInspectorStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.token).toEqual(mockToken); // Token should remain
  });

  it('should update the token when opening inspector again', () => {
    const newToken: Token = { ...mockToken, text: 'new' };
    const { openInspector } = useInspectorStore.getState();

    openInspector(mockToken);
    openInspector(newToken);

    const state = useInspectorStore.getState();
    expect(state.token).toEqual(newToken);
    expect(state.isOpen).toBe(true);
  });
});
