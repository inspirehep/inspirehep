import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_SUCCESS,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
} from '../actions/actionTypes';
import { fromJS } from 'immutable';

export const initialState = fromJS({
  loading: false,
  author: {},
  author_revisions: [],
});

const RecordEditorReducer = (state = initialState, action) => {
  switch (action.type) {
    case EDITOR_AUTHOR_REQUEST:
      return state.set('loading', true);
    case EDITOR_AUTHOR_ERROR:
      return state
        .set('loading', false)
        .set('author', initialState.get('author'));
    case EDITOR_AUTHOR_SUCCESS:
      return state
        .set('loading', false)
        .set('author', fromJS(action.payload.data));
    case EDITOR_AUTHOR_REVISIONS_REQUEST:
      return state.set('loading', true);
    case EDITOR_AUTHOR_REVISIONS_ERROR:
      return state
        .set('loading', false)
        .set('author_revisions', initialState.get('author_revisions'));
    case EDITOR_AUTHOR_REVISIONS_SUCCESS:
      return state
        .set('loading', false)
        .set('author_revisions', fromJS(action.payload.data));
    default:
      return state;
  }
};

export default RecordEditorReducer;
