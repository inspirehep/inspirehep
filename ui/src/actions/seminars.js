import { SEMINAR_REQUEST, SEMINAR_SUCCESS, SEMINAR_ERROR } from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import generateRecordFetchAction from './recordsFactory';
import { SEMINARS_PID_TYPE } from '../common/constants';

const fetchSeminar = generateRecordFetchAction({
  pidType: SEMINARS_PID_TYPE,
  fetchingActionActionType: SEMINAR_REQUEST,
  fecthSuccessActionType: SEMINAR_SUCCESS,
  fetchErrorActionType: SEMINAR_ERROR,
  requestOptions: UI_SERIALIZER_REQUEST_OPTIONS,
});

export default fetchSeminar;
