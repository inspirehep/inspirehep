import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_SUCCESS,
} from '../actions/actionTypes';
import { fromJS } from 'immutable';

export const initialState = fromJS({
  loading: false,
  author: {},
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
    default:
      return state;
  }
};

export default RecordEditorReducer;
