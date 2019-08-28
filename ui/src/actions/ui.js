import {
  UI_SET_BANNER_VISIBILITY,
} from './actionTypes';

export function setBannerVisibility(visibility) {
  return {
    type: UI_SET_BANNER_VISIBILITY,
    payload: { visibility }
  };
}
