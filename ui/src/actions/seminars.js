import { SEMINAR_REQUEST, SEMINAR_SUCCESS, SEMINAR_ERROR } from './actionTypes';
import generateRecordFetchAction from './recordsFactory';
import { SEMINARS_PID_TYPE } from '../common/constants';

const fetchSeminar = generateRecordFetchAction({
  pidType: SEMINARS_PID_TYPE,
  fetchingActionActionType: SEMINAR_REQUEST,
  fecthSuccessActionType: SEMINAR_SUCCESS,
  fetchErrorActionType: SEMINAR_ERROR,
});

export default fetchSeminar;
