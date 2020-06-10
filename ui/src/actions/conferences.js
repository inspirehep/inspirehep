import {
  CONFERENCE_REQUEST,
  CONFERENCE_SUCCESS,
  CONFERENCE_ERROR,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import generateRecordFetchAction from './recordsFactory';
import { CONFERENCES_PID_TYPE } from '../common/constants';

const fetchConference = generateRecordFetchAction({
  pidType: CONFERENCES_PID_TYPE,
  fetchingActionActionType: CONFERENCE_REQUEST,
  fecthSuccessActionType: CONFERENCE_SUCCESS,
  fetchErrorActionType: CONFERENCE_ERROR,
  requestOptions: UI_SERIALIZER_REQUEST_OPTIONS,
});

export default fetchConference;
