import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ParadigmGrid from './ParadigmGrid';
import * as paradigmUtils from '../utils/paradigm_utils';
import { Text, TouchableOpacity } from 'react-native';

// Mock the utils module to allow spying on exported functions
jest.mock('../utils/paradigm_utils', () => {
  const actual = jest.requireActual('../utils/paradigm_utils');
  return {
    ...actual,
    parseVerbParadigm: jest.fn((...args) => actual.parseVerbParadigm(...args)),
    parseNounParadigm: jest.fn((...args) => actual.parseNounParadigm(...args)),
  };
});

describe('ParadigmGrid Performance', () => {
  it('calls parseVerbParadigm only once on state change (optimized)', () => {
    const parseSpy = paradigmUtils.parseVerbParadigm;

    // Clear any previous calls
    (parseSpy as jest.Mock).mockClear();

    const paradigm = [
      { form: 'test', tags: ['present', 'active', '1st', 'singular'] }
    ];

    let component;
    act(() => {
      component = renderer.create(
        <ParadigmGrid paradigm={paradigm} pos="VERB" />
      );
    });

    // Initial render
    expect(parseSpy).toHaveBeenCalledTimes(1);

    // Find a tab to change state (e.g. Imperfect)
    const root = component.root;
    const touchables = root.findAllByType(TouchableOpacity);
    const imperfectTab = touchables.find(t => {
      try {
        const text = t.findByType(Text);
        return text.props.children === 'Imperfect';
      } catch (e) {
        return false;
      }
    });

    if (!imperfectTab) {
      throw new Error("Could not find Imperfect tab");
    }

    // Trigger state change
    act(() => {
      imperfectTab.props.onPress();
    });

    // Check calls - SHOULD BE 1 after optimization
    expect(parseSpy).toHaveBeenCalledTimes(1);
  });
});
