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
import { isCancelError } from '../common/http.ts';
import { httpErrorToActionPayload } from '../common/utils';
import generateRecordFetchAction from './recordsFactory';
import { LITERATURE_PID_TYPE } from '../common/constants';
import {
  assignSuccess,
  assignError,
  assigning,
} from '../literature/assignNotification';

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

export const fetchLiterature = generateRecordFetchAction({
  pidType: LITERATURE_PID_TYPE,
  fetchingActionActionType: LITERATURE_REQUEST,
  fecthSuccessActionType: LITERATURE_SUCCESS,
  fetchErrorActionType: LITERATURE_ERROR,
});

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

export function setLiteratureSelection(literatureIds, selected) {
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

export function setAssignDrawerVisibility(visible) {
  return {
    type: LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY,
    payload: { visible },
  };
}

export function assignPapers(conferenceId, conferenceTitle) {
  return async (dispatch, getState, http) => {
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
  return (dispatch, getState, http) => {
    const papers = getState().literature.get('literatureSelection');
    http.post('/assign/export-to-cds', {
      literature_recids: papers,
    });
    dispatch(clearLiteratureSelection());
  };
}
