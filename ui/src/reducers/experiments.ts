import {
  EXPERIMENT_REQUEST,
  EXPERIMENT_SUCCESS,
  EXPERIMENT_ERROR,
} from '../actions/actionTypes';
import generateRecordFetchReducer from './recordsFactory';

const experimentsReducer = generateRecordFetchReducer({
  fetchingActionActionType: EXPERIMENT_REQUEST,
  fecthSuccessActionType: EXPERIMENT_SUCCESS,
  fetchErrorActionType: EXPERIMENT_ERROR,
});

export default experimentsReducer;
