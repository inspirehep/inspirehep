import { fromJS } from 'immutable';

import {
  AUTHOR_SUBMIT_ERROR,
  AUTHOR_SUBMIT_SUCCESS,
  AUTHOR_UPDATE_FORM_DATA_REQUEST,
  AUTHOR_UPDATE_FORM_DATA_SUCCESS,
  AUTHOR_UPDATE_FORM_DATA_ERROR,
} from '../actions/actionTypes';

export const initialState = fromJS({
  author: {
    submitError: null,
    loadingUpdateData: false,
    updateData: null,
    updateDataError: null,
  },
});

export const authorSubmitErrorPath = ['author', 'submitError'];
export const authorUpdateDataPath = ['author', 'updateData'];
export const authorUpdateDataErrorPath = ['author', 'updateDataError'];
export const loadingAuthorUpdateDataPath = ['author', 'loadingUpdateData'];

const submissionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTHOR_SUBMIT_SUCCESS:
      return state.setIn(
        authorSubmitErrorPath,
        initialState.getIn(authorSubmitErrorPath)
      );
    case AUTHOR_SUBMIT_ERROR:
      return state.setIn(authorSubmitErrorPath, fromJS(action.payload));
    case AUTHOR_UPDATE_FORM_DATA_REQUEST:
      return state.setIn(loadingAuthorUpdateDataPath, true);
    case AUTHOR_UPDATE_FORM_DATA_SUCCESS:
      return state
        .setIn(loadingAuthorUpdateDataPath, false)
        .setIn(authorUpdateDataPath, fromJS(action.payload.data))
        .setIn(
          authorUpdateDataErrorPath,
          initialState.getIn(authorUpdateDataErrorPath)
        );
    case AUTHOR_UPDATE_FORM_DATA_ERROR:
      return state
        .setIn(loadingAuthorUpdateDataPath, false)
        .setIn(authorUpdateDataErrorPath, fromJS(action.payload))
        .setIn(authorUpdateDataPath, initialState.getIn(authorUpdateDataPath));
    default:
      return state;
  }
};

export default submissionsReducer;
