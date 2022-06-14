import {
  SEMINAR_REQUEST,
  SEMINAR_ERROR,
  SEMINAR_SUCCESS,
} from '../actions/actionTypes';
import generateRecordFetchReducer from './recordsFactory';

const seminarsReducer = generateRecordFetchReducer({
  fetchingActionActionType: SEMINAR_REQUEST,
  fecthSuccessActionType: SEMINAR_SUCCESS,
  fetchErrorActionType: SEMINAR_ERROR,
});

export default seminarsReducer;
