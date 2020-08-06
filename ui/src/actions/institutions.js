import {
  INSTITUTION_REQUEST,
  INSTITUTION_SUCCESS,
  INSTITUTION_ERROR,
} from './actionTypes';
import generateRecordFetchAction from './recordsFactory';
import { INSTITUTIONS_PID_TYPE } from '../common/constants';

const fetchInstitution = generateRecordFetchAction({
  pidType: INSTITUTIONS_PID_TYPE,
  fetchingActionActionType: INSTITUTION_REQUEST,
  fecthSuccessActionType: INSTITUTION_SUCCESS,
  fetchErrorActionType: INSTITUTION_ERROR,
});

export default fetchInstitution;
