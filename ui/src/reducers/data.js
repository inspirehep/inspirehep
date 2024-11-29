import {
    DATA_REQUEST,
    DATA_SUCCESS,
    DATA_ERROR,
  } from '../actions/actionTypes';
  import generateRecordFetchReducer from './recordsFactory';

  const dataReducer = generateRecordFetchReducer({
    fetchingActionActionType: DATA_REQUEST,
    fetchSuccessActionType: DATA_SUCCESS,
    fetchErrorActionType: DATA_ERROR,
  });

  export default dataReducer;
