// adapted from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Testing_for_availability
function isStorageAvailable() {
  let storage;
  try {
    // eslint-disable-next-line dot-notation
    storage = window['localStorage'];
    const test = '__test__';
    storage.setItem(test, test);
    storage.removeItem(test);
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

  getSync(key: any) {
    // eslint-disable-next-line react/no-this-in-sfc
    if (this.isAvailable) {
      const rawValue = localStorage.getItem(key);
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | null' is not assignable... Remove this comment to see the full error message
      return JSON.parse(rawValue);
    }
    return null;
  },

  async get(key: any) {
    return this.getSync(key);
  },

  async set(key: any, value: any) {
    if (this.isAvailable) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  async remove(key: any) {
    if (this.isAvailable) {
      localStorage.removeItem(key);
    }
  },
};

export default storage;
