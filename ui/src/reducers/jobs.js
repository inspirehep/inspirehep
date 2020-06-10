import { JOB_ERROR, JOB_REQUEST, JOB_SUCCESS } from '../actions/actionTypes';
import generateRecordFetchReducer from './recordsFactory';

const jobsReducer = generateRecordFetchReducer({
  fetchingActionActionType: JOB_REQUEST,
  fecthSuccessActionType: JOB_SUCCESS,
  fetchErrorActionType: JOB_ERROR,
});

export default jobsReducer;
