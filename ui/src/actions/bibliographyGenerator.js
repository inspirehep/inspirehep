import {
  BIBLIOGRAPHY_GENERATOR_SUCCESS,
  BIBLIOGRAPHY_GENERATOR_REQUEST,
  BIBLIOGRAPHY_GENERATOR_ERROR,
} from './actionTypes';
import { httpErrorToActionPayload } from '../common/utils';
import { BIBLIOGRAPHY_GENERATOR } from '../common/routes';

function submitBibliographyGeneratorSuccess(payload) {
  return {
    type: BIBLIOGRAPHY_GENERATOR_SUCCESS,
    payload,
  };
}

function submitBibliographyGeneratorRequest() {
  return {
    type: BIBLIOGRAPHY_GENERATOR_REQUEST,
  };
}

function submitBibliographyGeneratorError(error) {
  return {
    type: BIBLIOGRAPHY_GENERATOR_ERROR,
    payload: error,
  };
}

export function submitBibliographyGenerator(format, data) {
  return async (dispatch, getState, http) => {
    dispatch(submitBibliographyGeneratorRequest());
    try {
      const response = await http.post(
        `${BIBLIOGRAPHY_GENERATOR}?format=${format}`,
        data
      );
      dispatch(submitBibliographyGeneratorSuccess(response.data));
    } catch (error) {
      const errorPayload = httpErrorToActionPayload(error);
      dispatch(submitBibliographyGeneratorError(errorPayload));
    }
  };
}
