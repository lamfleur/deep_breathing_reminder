// content.js - listens for input and shows breathing reminder popup
// @ts-check
/* global chrome */

export const DEFAULT_OPTIONS = {
  displayTime: 2000,
  minInterval: 60000,
  message: '深呼吸しましょう',
};

/** @type {typeof DEFAULT_OPTIONS} */
let options = { ...DEFAULT_OPTIONS };

/** Timestamp of last popup display */
let lastShown = 0;

/**
 * Create popup element.
 * @returns {HTMLDivElement}
 */
export function createPopup() {
  const popup = document.createElement('div');
  popup.className = 'deep-breathing-popup';
  popup.textContent = options.message;
  popup.setAttribute('role', 'alert');
  return popup;
}

function ensureStyles() {
  if (document.getElementById('deep-breathing-style')) return;
  const link = document.createElement('link');
  link.id = 'deep-breathing-style';
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('style/popup.css');
  document.head.appendChild(link);
}

/**
 * Show popup if minimum interval has passed.
 */
export function showPopup() {
  const now = Date.now();
  if (now - lastShown < options.minInterval) return;
  lastShown = now;

  const popup = createPopup();
  document.body.appendChild(popup);
  requestAnimationFrame(() => {
    popup.classList.add('show');
  });

  setTimeout(() => {
    popup.classList.remove('show');
    popup.classList.add('fade-out');
    popup.addEventListener(
      'transitionend',
      () => popup.remove(),
      { once: true },
    );
  }, options.displayTime);
}

/**
 * Determine whether the event target should trigger the popup.
 * @param {EventTarget|null} target
 * @returns {boolean}
 */
export function shouldTrigger(target) {
  if (!(target instanceof Element)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') return true;
  return target.closest('[contenteditable="true"]') !== null;
}

function loadOptions() {
  chrome.storage.sync.get(DEFAULT_OPTIONS, (items) => {
    options = {
      displayTime: Number(items.displayTime) || DEFAULT_OPTIONS.displayTime,
      minInterval: Number(items.minInterval) || DEFAULT_OPTIONS.minInterval,
      message: String(items.message || DEFAULT_OPTIONS.message),
    };
  });
}

export function init() {
  loadOptions();
  ensureStyles();
  document.addEventListener('keydown', (e) => {
    if (shouldTrigger(e.target)) {
      showPopup();
    }
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes.displayTime) options.displayTime = Number(changes.displayTime.newValue);
    if (changes.minInterval) options.minInterval = Number(changes.minInterval.newValue);
    if (changes.message) options.message = String(changes.message.newValue);
  });
}
if (typeof chrome !== 'undefined' && chrome.runtime && !globalThis.__JEST__) {
  init();
}
