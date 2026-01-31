// src/services/SessionStore.ts

// A simple global variable to hold data between screens
let _currentDraft: any = null;
let _instructionText: string = "";

export const SessionStore = {
  setDraft: (data: any) => {
    _currentDraft = data;
  },
  setInstructions: (text: string) => {
    _instructionText = text;
  },
  getDraft: () => {
    return _currentDraft;
  },
  getInstructions: () => {
    return _instructionText;
  },
  clear: () => {
    _currentDraft = null;
    _instructionText = "";
  }
};