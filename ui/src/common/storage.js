import localforage from 'localforage';

localforage.config({
  name: 'inspirehep',
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
  version: 1.0,
});

export const rewriteLocalStorage = async () => {
  await Promise.all(Object.entries(localStorage).map(([key, value]) => {
    // With localforage we are not limited to strings like in localStorage,
    // therefore, we can try to re-write all the JSONs to JS objects.
    try {
      return localforage.setItem(key, JSON.parse(value));
    } catch (error) {
      return localforage.setItem(key, value);
    }
  }));

  localStorage.clear();
}

const storage = {
  async get(key) {
    try {
      return JSON.parse(await localforage.getItem(key))
    } catch {
      return localforage.getItem(key);
    }
  },

  async set(key, value) {
    await localforage.setItem(key, value);
  },

  async remove(key) {
    await localforage.removeItem(key);
  },
}

export default storage;
