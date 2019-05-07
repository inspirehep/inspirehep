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
  };
}

export default function fetchAuthor(recordId) {
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
  const query = {
    ...authorsState.getIn(['publications', 'query']).toJS(),
    ...newQuery,
  };
  return query;
}

function fetchingAuthorPublications(query) {
  return {
    type: AUTHOR_PUBLICATIONS_REQUEST,
    payload: query,
  };
}

function fetchAuthorPublicationSuccess(result) {
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

export function fetchAuthorPulications(newQuery = {}) {
  return async (dispatch, getState, http) => {
    const { authors } = getState();

    const query = getAuthorPublicationsQuery(authors, newQuery);
    dispatch(fetchingAuthorPublications(query));

    const authorFacetValue = authors.getIn([
      'data',
      'metadata',
      'facet_author_name',
    ]);
    const queryString = stringify(query, { indices: false });
    try {
      const response = await http.get(
        `/literature?author=${authorFacetValue}&${queryString}`,
        UI_SERIALIZER_REQUEST_OPTIONS
      );
      dispatch(fetchAuthorPublicationSuccess(response.data));
    } catch (error) {
      dispatch(
        fetchAuthorPublicationsError(error.response && error.response.data)
      );
    }
  };
}

function fetchingAuthorPublicationsFacets(query) {
  return {
    type: AUTHOR_PUBLICATIONS_FACETS_REQUEST,
    payload: query,
  };
}

function fetchAuthorPublicationFacetsSuccess(result) {
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

export function fetchAuthorPulicationsFacets(newQuery = {}) {
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
        `/literature/facets?facet_name=hep-author-publication&exclude_author_value=${authorFacetValue}&author=${authorFacetValue}&${queryString}`
      );
      dispatch(fetchAuthorPublicationFacetsSuccess(response.data));
    } catch (error) {
      dispatch(
        fetchAuthorPublicationsFacetsError(
          error.response && error.response.data
        )
      );
    }
  };
}
