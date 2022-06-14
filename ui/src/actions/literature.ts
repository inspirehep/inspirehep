// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'qs'.... Remove this comment to see the full error message
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
  LITERATURE_SELECTION_SET,
  LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY,
  LITERATURE_SELECTION_CLEAR,
} from './actionTypes';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import { isCancelError } from '../common/http.ts';
import { httpErrorToActionPayload } from '../common/utils';
import generateRecordFetchAction from './recordsFactory';
import { LITERATURE_PID_TYPE } from '../common/constants';
import {
  assignSuccess,
  assignError,
  assigning,
  exportToCdsSuccess,
  exportToCdsError,
  exporting,
} from '../literature/assignNotification';

import { LITERATURE_REFERENCES_NS } from '../search/constants';
import { searchQueryUpdate } from './search';

function fetchingLiteratureReferences(query: $TSFixMe) {
  return {
    type: LITERATURE_REFERENCES_REQUEST,
    payload: query.page,
  };
}

function fetchLiteratureReferencesSuccess(result: $TSFixMe) {
  return {
    type: LITERATURE_REFERENCES_SUCCESS,
    payload: result,
  };
}

function fetchLiteratureReferencesError(error: $TSFixMe) {
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

function fetchLiteratureAuthorsSuccess(result: $TSFixMe) {
  return {
    type: LITERATURE_AUTHORS_SUCCESS,
    payload: result,
  };
}

function fetchLiteratureAuthorsError(errorPayload: $TSFixMe) {
  return {
    type: LITERATURE_AUTHORS_ERROR,
    payload: errorPayload,
  };
}

export const fetchLiterature = generateRecordFetchAction({
  pidType: LITERATURE_PID_TYPE,
  fetchingActionActionType: LITERATURE_REQUEST,
  fecthSuccessActionType: LITERATURE_SUCCESS,
  fetchErrorActionType: LITERATURE_ERROR,
});

export function fetchLiteratureReferences(recordId: $TSFixMe, newQuery = {}) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
    const query = {
      ...{
        size: getState().search.getIn([
          'namespaces',
          LITERATURE_REFERENCES_NS,
          'query',
          'size',
        ]),
      },
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
      dispatch(searchQueryUpdate(LITERATURE_REFERENCES_NS, query));
    } catch (error) {
      if (!isCancelError(error)) {
        const payload = httpErrorToActionPayload(error);
        dispatch(fetchLiteratureReferencesError(payload));
      }
    }
  };
}

export function fetchLiteratureAuthors(recordId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
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

export function setLiteratureSelection(literatureIds: $TSFixMe, selected: $TSFixMe) {
  return {
    type: LITERATURE_SELECTION_SET,
    payload: { literatureIds, selected },
  };
}

export function clearLiteratureSelection() {
  return {
    type: LITERATURE_SELECTION_CLEAR,
  };
}

export function setAssignDrawerVisibility(visible: $TSFixMe) {
  return {
    type: LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY,
    payload: { visible },
  };
}

export function assignPapers(conferenceId: $TSFixMe, conferenceTitle: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
    try {
      const papers = getState().literature.get('literatureSelection');
      assigning();
      await http.post('/assign/conference', {
        conference_recid: conferenceId,
        literature_recids: papers,
      });
      assignSuccess({ conferenceId, conferenceTitle, papers });
      dispatch(clearLiteratureSelection());
      dispatch(setAssignDrawerVisibility(false));
    } catch (error) {
      assignError();
    }
  };
}

export function exportToCds() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, http: $TSFixMe) => {
    try {
      const papers = getState().literature.get('literatureSelection');
      exporting();
      await http.post('/assign/export-to-cds', {
        literature_recids: papers,
      });
      exportToCdsSuccess({ papers });
      dispatch(clearLiteratureSelection());
    } catch (error) {
      exportToCdsError();
    }
  };
}
