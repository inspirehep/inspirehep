import {
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  AUTHOR_ERROR,
  AUTHOR_PUBLICATION_SELECTION_CLEAR,
  AUTHOR_PUBLICATION_SELECTION_SET,
  AUTHOR_SET_ASSIGN_DRAWER_VISIBILITY,
  AUTHOR_PUBLICATION_CLAIM_SELECTION,
  AUTHOR_PUBLICATIONS_CLAIM_CLEAR,
  AUTHOR_PUBLICATION_UNCLAIM_SELECTION,
  AUTHOR_PUBLICATIONS_UNCLAIM_CLEAR,
} from './actionTypes';
import generateRecordFetchAction from './recordsFactory';
import { AUTHORS_PID_TYPE } from '../common/constants';
import {
  assignSuccess,
  assignError,
  assigning,
  assignSuccessOwnProfile,
  unassignSuccessOwnProfile,
  assignSuccessDifferentProfileClaimedPapers,
  assignSuccessDifferentProfileUnclaimedPapers,
} from '../authors/assignNotification';
import { searchQueryUpdate } from './search';
import { AUTHOR_PUBLICATIONS_NS } from '../search/constants';

const fetchAuthor = generateRecordFetchAction({
  pidType: AUTHORS_PID_TYPE,
  fetchingActionActionType: AUTHOR_REQUEST,
  fecthSuccessActionType: AUTHOR_SUCCESS,
  fetchErrorActionType: AUTHOR_ERROR,
});

export default fetchAuthor;

export function setPublicationSelection(publicationIds, selected) {
  return {
    type: AUTHOR_PUBLICATION_SELECTION_SET,
    payload: { publicationIds, selected },
  };
}

export function clearPublicationSelection() {
  return {
    type: AUTHOR_PUBLICATION_SELECTION_CLEAR,
  };
}

export function setPublicationsClaimedSelection(papersIds, selected) {
  return {
    type: AUTHOR_PUBLICATION_CLAIM_SELECTION,
    payload: { papersIds, selected },
  };
}

export function setPublicationsUnclaimedSelection(papersIds, selected) {
  return {
    type: AUTHOR_PUBLICATION_UNCLAIM_SELECTION,
    payload: { papersIds, selected },
  };
}

export function clearPublicationsClaimedSelection() {
  return {
    type: AUTHOR_PUBLICATIONS_CLAIM_CLEAR,
  };
}

export function clearPublicationsUnclaimedSelection() {
  return {
    type: AUTHOR_PUBLICATIONS_UNCLAIM_CLEAR,
  };
}

export function setAssignDrawerVisibility(visible) {
  return {
    type: AUTHOR_SET_ASSIGN_DRAWER_VISIBILITY,
    payload: { visible },
  };
}

export function assignPapers({ from, to }) {
  return async (dispatch, getState, http) => {
    try {
      const literatureIds = getState().authors.get('publicationSelection');

      assigning();
      await http.post('/assign/literature/assign', {
        from_author_recid: from,
        to_author_recid: to,
        literature_ids: literatureIds,
      });
      assignSuccess({ from, to, literatureIds });
      // add timestamp based query to in order to trigger search again
      dispatch(
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: Date.now() })
      );
      dispatch(clearPublicationSelection());
      dispatch(setAssignDrawerVisibility(false));
    } catch (error) {
      assignError();
    }
  };
}

export function unassignPapers({ from }) {
  return async (dispatch, getState, http) => {
    try {
      const literatureIds = getState().authors.get('publicationSelection');

      assigning();
      const { data } = await http.post('/assign/literature/unassign', {
        from_author_recid: from,
        literature_ids: literatureIds,
      });
      const newAuthor = data.stub_author_id;
      assignSuccess({ from, to: newAuthor, literatureIds });
      // add timestamp based query to in order to trigger search again
      dispatch(
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: Date.now() })
      );
      dispatch(clearPublicationSelection());
      dispatch(setAssignDrawerVisibility(false));
    } catch (error) {
      assignError();
    }
  };
}

export function assignOwnPapers({ from, to }) {
  return async (dispatch, getState, http) => {
    try {
      const claimedLiteratureIds = getState().authors.get(
        'publicationSelectionClaimed'
      );
      const unclaimedLiteratureIds = getState().authors.get(
        'publicationSelectionUnclaimed'
      );

      const literatureIds = getState().authors.get('publicationSelection');

      const numberOfUnclaimedPapers = unclaimedLiteratureIds.size;
      const numberOfClaimedPapers = claimedLiteratureIds.size;

      assigning();
      await http.post('/assign/literature/assign', {
        from_author_recid: from,
        to_author_recid: to,
        literature_ids: literatureIds,
      });

      assignSuccessOwnProfile({
        numberOfClaimedPapers,
        numberOfUnclaimedPapers,
      });

      // add timestamp based query to in order to trigger search again
      dispatch(
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: Date.now() })
      );
      dispatch(clearPublicationSelection());
      dispatch(clearPublicationsClaimedSelection());
      dispatch(clearPublicationsUnclaimedSelection());
    } catch (error) {
      assignError();
    }
  };
}

export function unassignOwnPapers({ from }) {
  return async (dispatch, getState, http) => {
    try {
      const literatureIds = getState().authors.get('publicationSelection');

      assigning();
      await http.post('/assign/literature/unassign', {
        from_author_recid: from,
        literature_ids: literatureIds,
      });

      unassignSuccessOwnProfile(literatureIds.size);

      // add timestamp based query to in order to trigger search again
      dispatch(
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: Date.now() })
      );
      dispatch(clearPublicationSelection());
      dispatch(clearPublicationsClaimedSelection());
      dispatch(clearPublicationsUnclaimedSelection());
    } catch (error) {
      assignError();
    }
  };
}

export function assignDifferentProfile({ from, to }) {
  return async (dispatch, getState, http) => {
    try {
      const literatureIds = getState().authors.get('publicationSelection');

      assigning();
      const { data } = await http.post(
        '/assign/literature/assign-different-profile',
        {
          from_author_recid: from,
          to_author_recid: to,
          literature_ids: literatureIds,
        }
      );

      if (Object.prototype.hasOwnProperty.call(data, 'created_rt_ticket')) {
        assignSuccessDifferentProfileClaimedPapers();
      } else {
        const numberOfUnclaimedPapers = literatureIds.size;
        assignSuccessDifferentProfileUnclaimedPapers(numberOfUnclaimedPapers);
      }

      // add timestamp based query to in order to trigger search again
      dispatch(
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: Date.now() })
      );
      dispatch(clearPublicationSelection());
    } catch (error) {
      assignError();
    }
  };
}
