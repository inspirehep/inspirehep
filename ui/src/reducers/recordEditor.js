import { fromJS } from 'immutable';
import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR,
  EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST,
  EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS,
  EDITOR_AUTHOR_SUCCESS,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
  EDITOR_AUTHOR_REVISION_DATA_REQUEST,
  EDITOR_AUTHOR_REVISION_DATA_ERROR,
  EDITOR_AUTHOR_REVISION_DATA_SUCCESS,
  EDITOR_AUTHOR_REVISION_DATA_RESET,
} from '../actions/actionTypes';

export const initialState = fromJS({
  author: {},
  author_revisions: [],
  current_author_revision: null,
  revisionError: null,
  saveError: null,
  fetchAuthorError: null,
  currentRecordETag: null,
});

const RecordEditorReducer = (state = initialState, action) => {
  switch (action.type) {
    case EDITOR_AUTHOR_REQUEST:
      return initialState;
    case EDITOR_AUTHOR_ERROR:
      return state
        .set('author', initialState.get('author'))
        .set('fetchAuthorError', action.payload.error.status)
        .set('current_author_revision', null);
    case EDITOR_AUTHOR_SUCCESS:
      return state
        .set('author', fromJS(action.payload.data))
        .set('currentRecordETag', fromJS(action.payload.eTag))
        .set('fetchAuthorError', null);
    case EDITOR_AUTHOR_REVISIONS_REQUEST:
      return state
        .set('author_revisions', initialState.get('author_revisions'))
        .set('revisionError', null);
    case EDITOR_AUTHOR_REVISIONS_ERROR:
      return state
        .set('author_revisions', initialState.get('author_revisions'))
        .set('revisionError', 'Error while fetching revisions');
    case EDITOR_AUTHOR_REVISIONS_SUCCESS:
      return state
        .set('author_revisions', fromJS(action.payload.data))
        .set('revisionError', null);
    case EDITOR_AUTHOR_REVISION_DATA_REQUEST:
      return state
        .set(
          'current_author_revision',
          initialState.get('current_author_revision')
        )
        .set('revisionError', null);
    case EDITOR_AUTHOR_REVISION_DATA_ERROR:
      return state
        .set(
          'current_author_revision',
          initialState.get('current_author_revision')
        )
        .set('revisionError', 'Error while fetching data from revision');
    case EDITOR_AUTHOR_REVISION_DATA_SUCCESS:
      return state
        .set('current_author_revision', fromJS(action.payload.data))
        .set('revisionError', null);
    case EDITOR_AUTHOR_REVISION_DATA_RESET:
      return state.set(
        'current_author_revision',
        initialState.get('current_author_revision')
      );
    case EDITOR_AUTHOR_SAVE_REQUEST:
      return state.set('saveError', initialState.get('saveError'));
    case EDITOR_AUTHOR_SAVE_SUCCESS:
      return state;
    case EDITOR_AUTHOR_SAVE_ERROR:
      return state.set('saveError', fromJS(action.payload.error));
    case EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST:
      return state;
    case EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS:
      return state;
    case EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR:
      return state;
    default:
      return state;
  }
};

export default RecordEditorReducer;
