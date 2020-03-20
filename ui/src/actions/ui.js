import { UI_CLOSE_BANNER } from './actionTypes';

export function closeBanner(id) {
  return {
    type: UI_CLOSE_BANNER,
    payload: { id },
  };
}
