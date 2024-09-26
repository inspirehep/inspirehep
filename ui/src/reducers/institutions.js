import {
  INSTITUTION_REQUEST,
  INSTITUTION_SUCCESS,
  INSTITUTION_ERROR,
} from '../actions/actionTypes';
import generateRecordFetchReducer from './recordsFactory';

const institutionsReducer = generateRecordFetchReducer({
  fetchingActionActionType: INSTITUTION_REQUEST,
  fetchSuccessActionType: INSTITUTION_SUCCESS,
  fetchErrorActionType: INSTITUTION_ERROR,
});

export default institutionsReducer;
