import { AUTHOR_REQUEST, AUTHOR_SUCCESS, AUTHOR_ERROR } from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import generateRecordFetchAction from './recordsFactory';
import { AUTHORS_PID_TYPE } from '../common/constants';

const fetchAuthor = generateRecordFetchAction({
  pidType: AUTHORS_PID_TYPE,
  fetchingActionActionType: AUTHOR_REQUEST,
  fecthSuccessActionType: AUTHOR_SUCCESS,
  fetchErrorActionType: AUTHOR_ERROR,
  requestOptions: UI_SERIALIZER_REQUEST_OPTIONS,
});

export default fetchAuthor;
