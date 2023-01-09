import { stringify } from 'qs';
import { Action, ActionCreator } from 'redux';
import { RootStateOrAny } from 'react-redux';

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
  LITERATURE_SET_ASSIGN_LITERATURE_ITEM_DRAWER_VISIBILITY,
} from './actionTypes';
import { isCancelError, HttpClientWrapper } from '../common/http';
import { httpErrorToActionPayload } from '../common/utils';
import { generateRecordFetchAction } from './recordsFactory';
import { LITERATURE_PID_TYPE } from '../common/constants';
import {
  assignSuccess,
  assignError,
  assigning,
  exportToCdsSuccess,
  exportToCdsError,
  exporting,
  assignLiteratureItemSuccess,
  assignLiteratureItemError,
  ASSIGNING_NOTIFICATION_KEY,
  ASSIGNING_NOTIFICATION_LITERATURE_ITEM_KEY,
} from '../literature/assignNotification';
import { LITERATURE_REFERENCES_NS } from '../search/constants';
import { searchQueryUpdate } from './search';
import { assignSuccessDifferentProfileClaimedPapers } from '../authors/assignNotification';

function fetchingLiteratureReferences(query: { page?: number; size?: number }) {
  return {
    type: LITERATURE_REFERENCES_REQUEST,
    payload: query.page,
  };
}

function fetchLiteratureReferencesSuccess<T>(result: {
  metadata: { references: T[] };
  references_count: number;
}) {
  return {
    type: LITERATURE_REFERENCES_SUCCESS,
    payload: result,
  };
}

function fetchLiteratureReferencesError(error: { error: Error }) {
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

function fetchLiteratureAuthorsSuccess<T>(result: {
  id: string;
  links: Record<string, string>;
  metadata: Record<string, T>;
}) {
  return {
    type: LITERATURE_AUTHORS_SUCCESS,
    payload: result,
  };
}

function fetchLiteratureAuthorsError(errorPayload: { error: Error }) {
  return {
    type: LITERATURE_AUTHORS_ERROR,
    payload: errorPayload,
  };
}

export const fetchLiterature = generateRecordFetchAction({
  pidType: LITERATURE_PID_TYPE,
  fetchingActionActionType: LITERATURE_REQUEST,
  fetchSuccessActionType: LITERATURE_SUCCESS,
  fetchErrorActionType: LITERATURE_ERROR,
});

export function fetchLiteratureReferences(
  recordId: string,
  newQuery = {}
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    const query: { size?: number; q?: string; assigned?: number } = {
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
    } catch (err) {
      if (!isCancelError(err as Error)) {
        const { error } = httpErrorToActionPayload(err);
        dispatch(fetchLiteratureReferencesError({ error }));
      }
    }
  };
}

export function fetchLiteratureAuthors(
  recordId: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    dispatch(fetchingLiteratureAuthors());
    try {
      const response = await http.get(
        `/literature/${recordId}/authors`,
        {},
        'literature-authors-detail'
      );
      dispatch(fetchLiteratureAuthorsSuccess(response.data));
    } catch (err) {
      if (!isCancelError(err as Error)) {
        const { error } = httpErrorToActionPayload(err);
        dispatch(fetchLiteratureAuthorsError({ error }));
      }
    }
  };
}

export function setLiteratureSelection(
  literatureIds: string[],
  selected: boolean
) {
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

export function setAssignDrawerVisibility(visible: boolean) {
  return {
    type: LITERATURE_SET_ASSIGN_DRAWER_VISIBILITY,
    payload: { visible },
  };
}

export function setAssignLiteratureItemDrawerVisibility(
  literatureId: number | null
) {
  return {
    type: LITERATURE_SET_ASSIGN_LITERATURE_ITEM_DRAWER_VISIBILITY,
    payload: { literatureId },
  };
}

export function assignLiteratureItem({
  from,
  to,
  literatureId,
}: {
  from: string;
  to: number;
  literatureId: number;
}): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    try {
      assigning(ASSIGNING_NOTIFICATION_LITERATURE_ITEM_KEY);
      const { data } = await http.post('/assign/literature/assign', {
        from_author_recid: from,
        to_author_recid: to,
        literature_ids: [literatureId],
      });
      if (data) assignLiteratureItemSuccess();
    } catch (error) {
      assignError(ASSIGNING_NOTIFICATION_LITERATURE_ITEM_KEY);
    }
  };
}

export function assignLiteratureItemNoNameMatch({
  from,
  to,
  literatureId,
}: {
  from: number | undefined;
  to: number;
  literatureId: number;
}): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    try {
      assigning(ASSIGNING_NOTIFICATION_LITERATURE_ITEM_KEY);
      const { data } = await http.post(
        '/assign/literature/assign-different-profile',
        {
          from_author_recid: from,
          to_author_recid: to,
          literature_ids: [literatureId],
        }
      );
      if (Object.prototype.hasOwnProperty.call(data, 'created_rt_ticket')) {
        assignSuccessDifferentProfileClaimedPapers();
        dispatch(setAssignLiteratureItemDrawerVisibility(null));
      } else {
        assignLiteratureItemError(ASSIGNING_NOTIFICATION_LITERATURE_ITEM_KEY);
      }
    } catch (error) {
      assignLiteratureItemError(ASSIGNING_NOTIFICATION_LITERATURE_ITEM_KEY);
    }
  };
}

export function checkNameCompatibility({
  to,
  literatureId,
}: {
  to: number;
  literatureId: number;
}): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    try {
      const { data } = await http.get(
        `/assign/check-names-compatibility?literature_recid=${literatureId}`
      );
      if (data.matched_author_recid === to) {
        dispatch(
          assignLiteratureItem({
            from: data.matched_author_recid,
            to,
            literatureId,
          })
        );
      } else {
        dispatch(
          assignLiteratureItemNoNameMatch({
            from: data.matched_author_recid,
            to,
            literatureId,
          })
        );
      }
    } catch (error) {
      dispatch(setAssignLiteratureItemDrawerVisibility(literatureId));
    }
  };
}

export function assignPapers(
  conferenceId: string,
  conferenceTitle: string
): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
    try {
      const papers = getState().literature.get('literatureSelection');
      assigning(ASSIGNING_NOTIFICATION_KEY);
      await http.post('/assign/conference', {
        conference_recid: conferenceId,
        literature_recids: papers,
      });
      assignSuccess({ conferenceId, conferenceTitle, papers });
      dispatch(clearLiteratureSelection());
      dispatch(setAssignDrawerVisibility(false));
    } catch (error) {
      assignError(ASSIGNING_NOTIFICATION_KEY);
    }
  };
}

export function exportToCds(): (
  dispatch: ActionCreator<Action>,
  getState: () => RootStateOrAny,
  http: HttpClientWrapper
) => Promise<void> {
  return async (dispatch, getState, http) => {
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
