import { stringify } from 'qs';
import {
  LITERATURE_ERROR,
  LITERATURE_REQUEST,
  LITERATURE_SUCCESS,
  LITERATURE_REFERENCES_ERROR,
  LITERATURE_REFERENCES_REQUEST,
  LITERATURE_REFERENCES_SUCCESS,
  LITERATURE_AUTHORS_ERROR,
  LITERATURE_AUTHORS_REQUEST,
  LITERATURE_AUTHORS_SUCCESS,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS, isCancelError } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

function fetchingLiterature(recordId) {
  return {
    type: LITERATURE_REQUEST,
    payload: { recordId },
  };
}

function fetchLiteratureSuccess(result) {
  return {
    type: LITERATURE_SUCCESS,
    payload: result,
  };
}

function fetchLiteratureError(error) {
  return {
    type: LITERATURE_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

function fetchingLiteratureReferences(query) {
  return {
    type: LITERATURE_REFERENCES_REQUEST,
    payload: query,
  };
}

function fetchLiteratureReferencesSuccess(result) {
  return {
    type: LITERATURE_REFERENCES_SUCCESS,
    payload: result,
  };
}

function fetchLiteratureReferencesError(error) {
  return {
    type: LITERATURE_REFERENCES_ERROR,
    payload: error,
  };
}

function fetchingLiteratureAuthors() {
  return {
    type: LITERATURE_AUTHORS_REQUEST,
  };
}

function fetchLiteratureAuthorsSuccess(result) {
  return {
    type: LITERATURE_AUTHORS_SUCCESS,
    payload: result,
  };
}

function fetchLiteratureAuthorsError(errorPayload) {
  return {
    type: LITERATURE_AUTHORS_ERROR,
    payload: errorPayload,
  };
}

export function fetchLiterature(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingLiterature(recordId));
    try {
      const response = await http.get(
        `/literature/${recordId}`,
        UI_SERIALIZER_REQUEST_OPTIONS,
        'literature-detail'
      );
      dispatch(fetchLiteratureSuccess(response.data));
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchLiteratureError(payload));
      }
    }
  };
}

export function fetchLiteratureReferences(recordId, newQuery = {}) {
  return async (dispatch, getState, http) => {
    const { literature } = getState();
    const query = {
      ...literature.get('queryReferences').toJS(),
      ...newQuery,
    };
    dispatch(fetchingLiteratureReferences(query));
    const queryString = stringify(query, { indices: false });
    try {
      const response = await http.get(
        `/literature/${recordId}/references?${queryString}`,
        {},
        'literature-references-detail'
      );
      dispatch(fetchLiteratureReferencesSuccess(response.data));
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchLiteratureReferencesError(payload));
      }
    }
  };
}

export function fetchLiteratureAuthors(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingLiteratureAuthors());
    try {
      const response = await http.get(
        `/literature/${recordId}/authors`,
        {},
        'literature-authors-detail'
      );
      dispatch(fetchLiteratureAuthorsSuccess(response.data));
    } catch (error) {
      if (!isCancelError(error)) {
        const errorPayload = httpErrorToActionPayload(error);
        dispatch(fetchLiteratureAuthorsError(errorPayload));
      }
    }
  };
}
