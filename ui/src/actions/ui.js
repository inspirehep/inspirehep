import {
  UI_SET_BANNER_VISIBILITY,
} from './actionTypes';

// eslint-disable-next-line import/prefer-default-export
export function setBannerVisibility(visibility) {
  return {
    type: UI_SET_BANNER_VISIBILITY,
    payload: { visibility }
  };
}
