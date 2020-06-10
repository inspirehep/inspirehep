import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
} from '../actions/actionTypes';
import generateRecordFetchReducer from './recordsFactory';

const authorsReducer = generateRecordFetchReducer({
  fetchingActionActionType: AUTHOR_REQUEST,
  fecthSuccessActionType: AUTHOR_SUCCESS,
  fetchErrorActionType: AUTHOR_ERROR,
});

export default authorsReducer;
