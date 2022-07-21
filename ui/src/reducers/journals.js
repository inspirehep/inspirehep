import {
  JOURNAL_REQUEST,
  JOURNAL_SUCCESS,
  JOURNAL_ERROR,
} from '../actions/actionTypes';
import generateRecordFetchReducer from './recordsFactory';

const journalsReducer = generateRecordFetchReducer({
  fetchingActionActionType: JOURNAL_REQUEST,
  fecthSuccessActionType: JOURNAL_SUCCESS,
  fetchErrorActionType: JOURNAL_ERROR,
});

export default journalsReducer;
