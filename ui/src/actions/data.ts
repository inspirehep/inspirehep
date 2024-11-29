import {
    DATA_REQUEST,
    DATA_SUCCESS,
    DATA_ERROR,
  } from './actionTypes';
  import { DATA_PID_TYPE,  } from '../common/constants';
  import { generateRecordFetchAction } from './recordsFactory';

  const fetchData = generateRecordFetchAction({
    pidType: DATA_PID_TYPE,
    fetchingActionActionType: DATA_REQUEST,
    fetchSuccessActionType: DATA_SUCCESS,
    fetchErrorActionType: DATA_ERROR,
  });

  export default fetchData;
