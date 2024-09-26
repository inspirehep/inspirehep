import { SEARCH_BOX_NAMESPACES } from '../../../search/constants';
import LRASet from './LRASet';
import storage from '../../storage';

const STORAGE_KEY = 'search-box-history';
const HISTORY_LIMIT = 25;

function runWhenIdle(task) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(
      () => {
        task();
      },
      { timeout: 10000 }
    );
  } else {
    // TODO: find a good polyfill instead like: https://github.com/facebook/react/pull/8833
    task();
  }
}

export function persistHistory(history) {
  runWhenIdle(async () => {
    await storage.set(STORAGE_KEY, history);
  });
}

export function readHistory(callback) {
  return runWhenIdle(async () => {
    const historyFromStorage = (await storage.get(STORAGE_KEY)) || {};

    const history = {};
    SEARCH_BOX_NAMESPACES.forEach(namespace => {
      history[namespace] = new LRASet(
        historyFromStorage[namespace],
        HISTORY_LIMIT
      );
    });
    callback(history);
  });
}
