import { stringify } from 'qs';

import {
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  AUTHOR_ERROR,
  AUTHOR_PUBLICATIONS_REQUEST,
  AUTHOR_PUBLICATIONS_SUCCESS,
  AUTHOR_PUBLICATIONS_ERROR,
  AUTHOR_PUBLICATIONS_FACETS_REQUEST,
  AUTHOR_PUBLICATIONS_FACETS_SUCCESS,
  AUTHOR_PUBLICATIONS_FACETS_ERROR,
} from './actionTypes';
import { UI_SERIALIZER_REQUEST_OPTIONS } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';

function fetchingAuthor(recordId) {
  return {
    type: AUTHOR_REQUEST,
    payload: { recordId },
  };
}

function fetchAuthorSuccess(result) {
  return {
    type: AUTHOR_SUCCESS,
    payload: result,
  };
}

function fetchAuthorError(error) {
  return {
    type: AUTHOR_ERROR,
    payload: error,
    meta: { redirectableError: true },
  };
}

export function fetchAuthor(recordId) {
  return async (dispatch, getState, http) => {
    dispatch(fetchingAuthor(recordId));
    try {
      const response = await http.get(
        `/authors/${recordId}`,
        UI_SERIALIZER_REQUEST_OPTIONS
      );
      dispatch(fetchAuthorSuccess(response.data));
    } catch (error) {
      dispatch(fetchAuthorError(error.response && error.response.data));
    }
  };
}

function getAuthorPublicationsQuery(authorsState, newQuery) {
  return {
    ...authorsState.getIn(['publications', 'query']).toJS(),
    ...newQuery,
  };
}

function fetchingAuthorPublications(query) {
  return {
    type: AUTHOR_PUBLICATIONS_REQUEST,
    payload: query,
  };
}

function fetchAuthorPublicationsSuccess(result) {
  return {
    type: AUTHOR_PUBLICATIONS_SUCCESS,
    payload: result,
  };
}

function fetchAuthorPublicationsError(error) {
  return {
    type: AUTHOR_PUBLICATIONS_ERROR,
    payload: error,
  };
}

export function fetchAuthorPublications(newQuery = {}) {
  return async (dispatch, getState, http) => {
    const { authors } = getState();

    const query = getAuthorPublicationsQuery(authors, newQuery);
    dispatch(fetchingAuthorPublications(query));

    const queryString = stringify(query, { indices: false });
    try {
      const response = await http.get(
        `/literature?${queryString}`,
        UI_SERIALIZER_REQUEST_OPTIONS
      );
      dispatch(fetchAuthorPublicationsSuccess(response.data));
    } catch (error) {
      const payload = httpErrorToActionPayload(error);
      dispatch(fetchAuthorPublicationsError(payload));
    }
  };
}

function fetchingAuthorPublicationsFacets(query) {
  return {
    type: AUTHOR_PUBLICATIONS_FACETS_REQUEST,
    payload: query,
  };
}

function fetchAuthorPublicationsFacetsSuccess(result) {
  return {
    type: AUTHOR_PUBLICATIONS_FACETS_SUCCESS,
    payload: result,
  };
}

function fetchAuthorPublicationsFacetsError(error) {
  return {
    type: AUTHOR_PUBLICATIONS_FACETS_ERROR,
    payload: error,
  };
}

const FACET_NAME = 'hep-author-publication';
export function fetchAuthorPublicationsFacets(newQuery = {}) {
  return async (dispatch, getState, http) => {
    const { authors } = getState();

    const query = getAuthorPublicationsQuery(authors, newQuery);

    dispatch(fetchingAuthorPublicationsFacets(query));

    const authorFacetValue = authors.getIn([
      'data',
      'metadata',
      'facet_author_name',
    ]);
    const queryString = stringify(query, { indices: false });
    try {
      const response = await http.get(
        `/literature/facets?facet_name=${FACET_NAME}&exclude_author_value=${authorFacetValue}&${queryString}`
      );
      dispatch(fetchAuthorPublicationsFacetsSuccess(response.data));
    } catch (error) {
      const payload = httpErrorToActionPayload(error);
      dispatch(fetchAuthorPublicationsFacetsError(payload));
    }
  };
}
