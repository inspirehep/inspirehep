import { JOB_REQUEST, JOB_SUCCESS, JOB_ERROR } from './actionTypes';
import generateRecordFetchAction from './recordsFactory';
import { JOBS_PID_TYPE } from '../common/constants';

const fetchJob = generateRecordFetchAction({
  pidType: JOBS_PID_TYPE,
  fetchingActionActionType: JOB_REQUEST,
  fecthSuccessActionType: JOB_SUCCESS,
  fetchErrorActionType: JOB_ERROR,
});

export default fetchJob;
