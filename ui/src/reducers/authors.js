/* eslint-disable no-case-declarations */
import { Map, Set } from 'immutable';
import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  CLEAR_STATE,
  AUTHOR_PUBLICATION_SELECTION_SET,
  AUTHOR_PUBLICATION_SELECTION_CLEAR,
  AUTHOR_SET_ASSIGN_DRAWER_VISIBILITY,
} from '../actions/actionTypes';
import {
  onRequest,
  onSuccess,
  onError,
  initialState as initialRecordState,
} from './recordsFactory';

export const initialState = Map({
  publicationSelection: Set(),
  isAssignDrawerVisible: false,
}).merge(initialRecordState);

const authorsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case AUTHOR_REQUEST:
      return onRequest(state);
    case AUTHOR_SUCCESS:
      return onSuccess(state, action);
    case AUTHOR_ERROR:
      return onError(state, action);
    case AUTHOR_PUBLICATION_SELECTION_SET:
      const { publicationIds, selected } = action.payload;
      const selectionUpdate = Set(publicationIds);
      const currentSelection = state.get('publicationSelection');
      const nextSelection = selected
        ? currentSelection.union(selectionUpdate)
        : currentSelection.subtract(selectionUpdate);
      return state.set('publicationSelection', nextSelection);
    case AUTHOR_PUBLICATION_SELECTION_CLEAR:
      return state.set('publicationSelection', Set());
    case AUTHOR_SET_ASSIGN_DRAWER_VISIBILITY:
      return state.set('isAssignDrawerVisible', action.payload.visible);
    default:
      return state;
  }
};

export default authorsReducer;
