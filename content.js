const DEFAULT_OPTIONS = {
  displayTime: 1500,
  minInterval: 30000,
  message: '深呼吸しましょう'
};

let options = { ...DEFAULT_OPTIONS };
let lastShown = 0;
let isComposing = false;

function createPopup() {
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

function showPopup() {
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
    popup.addEventListener('transitionend', () => popup.remove(), { once: true });
  }, options.displayTime);
}

function isEditable(target) {
  if (!(target instanceof Element)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') return true;
  if (target.isContentEditable) return true;
  if ((target.getAttribute('role') || '').toLowerCase() === 'textbox') return true;
  const aria = (target.getAttribute('aria-label') || '').toLowerCase();
  if (aria.includes('編集') || aria.includes('edit')) return true;
  if (target.hasAttribute('tabindex') && getComputedStyle(target).userSelect !== 'none') return true;
  const cls = (target.className || '').toString().toLowerCase();
  if (cls.includes('input') || cls.includes('editor') || cls.includes('notebook')) return true;
  return false;
}

function loadOptions() {
  chrome.storage.sync.get(DEFAULT_OPTIONS, (items) => {
    options = {
      displayTime: Number(items.displayTime) || DEFAULT_OPTIONS.displayTime,
      minInterval: Number(items.minInterval) || DEFAULT_OPTIONS.minInterval,
      message: String(items.message || DEFAULT_OPTIONS.message)
    };
  });
}

function init() {
  loadOptions();
  ensureStyles();

  document.addEventListener('compositionstart', () => { isComposing = true; });
  document.addEventListener('compositionend', () => { isComposing = false; });

  document.addEventListener('keydown', (e) => {
    if (isComposing) return;
    if (!isEditable(e.target)) return;

    // 除外するキー（文字入力にならないもの）
    const ignoreKeys = [
      'Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'CapsLock', 'PageUp', 'PageDown', 'Home', 'End', 'Insert', 'Delete',
      'ContextMenu', 'NumLock', 'ScrollLock', 'Pause', 'PrintScreen'
    ];
    // F1-F12キーも除外
    if (/^F\d{1,2}$/.test(e.key)) return;
    if (ignoreKeys.includes(e.key)) return;

    showPopup();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes.displayTime) options.displayTime = Number(changes.displayTime.newValue);
    if (changes.minInterval) options.minInterval = Number(changes.minInterval.newValue);
    if (changes.message) options.message = String(changes.message.newValue);
  });
}

init();
