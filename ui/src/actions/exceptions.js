import { EXCEPTIONS_REQUEST, EXCEPTIONS_SUCCESS } from './actionTypes';
import data from '../holdingpen/report-errors.json';

function fetching() {
  return {
    type: EXCEPTIONS_REQUEST,
  };
}

function fetchSuccess(result) {
  return {
    type: EXCEPTIONS_SUCCESS,
    payload: result,
  };
}

export default function fetch() {
  return async dispatch => {
    dispatch(fetching());
    dispatch(fetchSuccess(data));
  };
}
