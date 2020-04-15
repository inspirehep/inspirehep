import { SEARCH_BOX_NAMESPACES } from '../../../reducers/search';
import LRASet from './LRASet';

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
  runWhenIdle(() => {
    const rawHistory = JSON.stringify(history);
    localStorage.setItem(STORAGE_KEY, rawHistory);
  });
}

export function readHistory(callback) {
  return runWhenIdle(() => {
    const rawHistory = localStorage.getItem(STORAGE_KEY);
    const historyFromStorage = rawHistory ? JSON.parse(rawHistory) : {};

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
