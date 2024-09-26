import {
  UI_CLOSE_BANNER,
  UI_CHANGE_GUIDE_MODAL_VISIBILITY,
  UI_SCROLL_VIEWPORT_TO_PREVIOUS_REFERENCE,
} from './actionTypes';

export function closeBanner(id: string) {
  return {
    type: UI_CLOSE_BANNER,
    payload: { id },
  };
}

export function changeGuideModalVisibility(visibility: boolean) {
  return {
    type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
    payload: { visibility },
  };
}

export function setScrollElement(element: string | null) {
  return {
    type: UI_SCROLL_VIEWPORT_TO_PREVIOUS_REFERENCE,
    payload: { element },
  };
}
