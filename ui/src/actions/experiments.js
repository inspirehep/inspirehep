import {
  EXPERIMENT_REQUEST,
  EXPERIMENT_SUCCESS,
  EXPERIMENT_ERROR,
} from './actionTypes';
import { EXPERIMENTS_PID_TYPE } from '../common/constants';
import generateRecordFetchAction from './recordsFactory';

const fetchExperiment = generateRecordFetchAction({
  pidType: EXPERIMENTS_PID_TYPE,
  fetchingActionActionType: EXPERIMENT_REQUEST,
  fecthSuccessActionType: EXPERIMENT_SUCCESS,
  fetchErrorActionType: EXPERIMENT_ERROR,
});

export default fetchExperiment;
