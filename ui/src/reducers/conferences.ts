import {
  CONFERENCE_ERROR,
  CONFERENCE_REQUEST,
  CONFERENCE_SUCCESS,
} from '../actions/actionTypes';
import generateRecordFetchReducer from './recordsFactory';

const conferencesReducer = generateRecordFetchReducer({
  fetchingActionActionType: CONFERENCE_REQUEST,
  fecthSuccessActionType: CONFERENCE_SUCCESS,
  fetchErrorActionType: CONFERENCE_ERROR,
});

export default conferencesReducer;
