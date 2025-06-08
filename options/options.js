/* global chrome */
const DEFAULT_OPTIONS = {
  displayTime: 2000,
  minInterval: 60000,
  message: '深呼吸しましょう',
};

/**
 * Restore saved options to the form.
 */
function restoreOptions() {
  chrome.storage.sync.get(DEFAULT_OPTIONS, (items) => {
    document.getElementById('displayTime').value = items.displayTime;
    document.getElementById('minInterval').value = items.minInterval;
    document.getElementById('message').value = items.message;
  });
}

/**
 * Save current form values to storage.
 */
function saveOptions() {
  const displayTime = Number(document.getElementById('displayTime').value);
  const minInterval = Number(document.getElementById('minInterval').value);
  const message = document.getElementById('message').value;
  chrome.storage.sync.set({ displayTime, minInterval, message });
}

document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();
  document.getElementById('options-form').addEventListener('input', saveOptions);
});
