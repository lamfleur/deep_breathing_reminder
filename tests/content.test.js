import { createPopup, shouldTrigger } from '../content.js';

globalThis.__JEST__ = true;

describe('content script utilities', () => {
  test('createPopup returns element with text and role', () => {
    const el = createPopup();
    expect(el.textContent).toBe('深呼吸しましょう');
    expect(el.getAttribute('role')).toBe('alert');
  });

  test('shouldTrigger detects input elements', () => {
    const input = document.createElement('input');
    const textarea = document.createElement('textarea');
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    expect(shouldTrigger(input)).toBe(true);
    expect(shouldTrigger(textarea)).toBe(true);
    expect(shouldTrigger(div)).toBe(true);
  });
});
