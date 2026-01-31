// src/services/SessionStore.ts

// A simple global variable to hold data between screens
let _currentDraft: any = null;
let _instructionText: string = "";
let _isAlreadyFilled: boolean = false;
let _theme: string = "";

export const SessionStore = {
  setDraft: (data: any, isFilled: boolean = false) => {
    _currentDraft = data;
    _isAlreadyFilled = isFilled;
  },
  setInstructions: (text: string) => {
    _instructionText = text;
  },
  setTheme: (theme: string) => {
    _theme = theme;
  },
  getDraft: () => {
    return _currentDraft;
  },
  getInstructions: () => {
    return _instructionText;
  },
  getTheme: () => {
    return _theme;
  },
  isFilled: () => {
    return _isAlreadyFilled;
  },
  clear: () => {
    _currentDraft = null;
    _instructionText = "";
    _isAlreadyFilled = false;
    _theme = "";
  }
};
