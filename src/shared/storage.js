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

  async modify(key, modifiedItem, value) {
    console.log(`key: ${key} value: ${value} modifiedItem: ${modifiedItem}`)
    chrome.storage.sync.get(key, (data) => {
      let values = data[key] || {};
      switch (modifiedItem) {
        case ("name"):
          values.name = value
          break;
        case ("type"):
          values.type = value
          break;
        case ("desc"):
          values.desc = value
          break;
      }      
      return new Promise((resolve) => {
        chrome.storage.sync.set({ [key]: values }, () => resolve());
      });
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