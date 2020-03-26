import {
  UI_CLOSE_BANNER,
  UI_CHANGE_GUIDE_MODAL_VISIBILITY,
} from './actionTypes';

export function closeBanner(id) {
  return {
    type: UI_CLOSE_BANNER,
    payload: { id },
  };
}

export function changeGuideModalVisibility(visibility) {
  return {
    type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
    payload: { visibility },
  };
}
