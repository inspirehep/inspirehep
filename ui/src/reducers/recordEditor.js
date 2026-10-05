import { fromJS } from 'immutable';
import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_SUCCESS,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
} from '../actions/actionTypes';

export const initialState = fromJS({
  author: {},
  author_revisions: [],
  saveError: null,
  fetchAuthorError: null,
  currentRecordETag: null,
});

const RecordEditorReducer = (state = initialState, action) => {
  switch (action.type) {
    case EDITOR_AUTHOR_REQUEST:
      return state
        .set('fetchAuthorError', null)
        .set('author', initialState.get('author'));
    case EDITOR_AUTHOR_ERROR:
      return state
        .set('author', initialState.get('author'))
        .set('fetchAuthorError', action.payload.error.status);
    case EDITOR_AUTHOR_SUCCESS:
      return state
        .set('author', fromJS(action.payload.data))
        .set('currentRecordETag', fromJS(action.payload.eTag))
        .set('fetchAuthorError', null);
    case EDITOR_AUTHOR_REVISIONS_REQUEST:
      return state;
    case EDITOR_AUTHOR_REVISIONS_ERROR:
      return state.set(
        'author_revisions',
        initialState.get('author_revisions')
      );
    case EDITOR_AUTHOR_REVISIONS_SUCCESS:
      return state.set('author_revisions', fromJS(action.payload.data));
    case EDITOR_AUTHOR_SAVE_REQUEST:
      return state.set('saveError', initialState.get('saveError'));
    case EDITOR_AUTHOR_SAVE_SUCCESS:
      return state;
    case EDITOR_AUTHOR_SAVE_ERROR:
      return state.set('saveError', fromJS(action.payload.error));
    default:
      return state;
  }
};

export default RecordEditorReducer;
