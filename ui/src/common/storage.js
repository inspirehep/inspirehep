import localforage from 'localforage';

localforage.config({
  name: 'inspirehep',
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
  version: 1.0,
});

const rewriteUserSettingsFromLocalStorage = async () => 
  Promise.all(Object.entries(localStorage).map(async ([key, value]) => localforage.setItem(key, value)));

// adapted from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Testing_for_availability
async function isStorageAvailable() {
  let storage;
  try {
    // eslint-disable-next-line dot-notation
    storage = localforage;
    const test = '__test__';
    await storage.setItem(test, test);
    await storage.removeItem(test);
    await rewriteUserSettingsFromLocalStorage();
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.code === 22 ||
        e.code === 1014 ||
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      (storage && storage.length !== 0)
    );
  }
}

const storage = {
  isAvailable: isStorageAvailable(),

  async getSync(key) {
    // eslint-disable-next-line react/no-this-in-sfc
    if (this.isAvailable) {
      const rawValue = await localforage.getItem(key);
      return JSON.parse(rawValue);
    }
    return null;
  },

  async get(key) {
    return this.getSync(key);
  },

  async set(key, value) {
    if (this.isAvailable) {
      await localforage.setItem(key, JSON.stringify(value));
    }
  },

  async remove(key) {
    if (this.isAvailable) {
      await localforage.removeItem(key);
    }
  },
};

export default storage;
