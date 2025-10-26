// shared/storage.js
export const Storage = {
  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => {
        resolve(result);
      });
    });
  },

  async set(data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, () => resolve());
    });
  },

  async remove(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(key, () => resolve());
    });
  },

  async getAllKeys() {
    return new Promise((resolve) => {
      const list = []
      chrome.storage.sync.get(null, function(items) {
        resolve(Object.keys(items));
      });
    });
  },
  
  onChange(callback) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync') callback(changes);
    });
  },
};