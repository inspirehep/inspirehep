import {
  UI_CLOSE_BANNER,
  UI_CHANGE_GUIDE_MODAL_VISIBILITY,
  UI_CHANGE_EXCLUDE_SELF_CITATIONS,
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

export function changeExcludeSelfCitations(isEnabled) {
  return {
    type: UI_CHANGE_EXCLUDE_SELF_CITATIONS,
    payload: { isEnabled },
  };
}
