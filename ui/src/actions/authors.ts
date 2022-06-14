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
  AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION,
  AUTHOR_PUBLICATION_CAN_NOT_CLAIM_CLEAR,
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

export function setPublicationsCanNotClaimSelection(papersIds, selected) {
  return {
    type: AUTHOR_PUBLICATION_CAN_NOT_CLAIM_SELECTION,
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

export function clearPublicationsCanNotClaimSelection() {
  return {
    type: AUTHOR_PUBLICATION_CAN_NOT_CLAIM_CLEAR,
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
      const papers = getState().authors.get('publicationSelection');
      assigning();
      const { data } = await http.post('/assign/author', {
        from_author_recid: from,
        to_author_recid: to,
        literature_recids: papers,
      });
      const toOrNewAuthor = to || data.stub_author_id;
      assignSuccess({ from, to: toOrNewAuthor, papers });
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

export function assignOwnPapers({ from, to, isUnassignAction }) {
  return async (dispatch, getState, http) => {
    try {
      const claimedPapers = getState().authors.get(
        'publicationSelectionClaimed'
      );
      const unclaimedPapers = getState().authors.get(
        'publicationSelectionUnclaimed'
      );

      const paperIds = getState().authors.get('publicationSelection');

      const numberOfUnclaimedPapers = unclaimedPapers.size;
      const numberOfClaimedPapers = claimedPapers.size;

      assigning();
      await http.post('/assign/author', {
        from_author_recid: from,
        to_author_recid: to,
        literature_recids: paperIds,
      });

      if (isUnassignAction) {
        unassignSuccessOwnProfile();
      } else {
        assignSuccessOwnProfile({
          numberOfClaimedPapers,
          numberOfUnclaimedPapers,
        });
      }

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

export function assignDifferentProfileClaimedPapers({ from, to }) {
  return async (dispatch, getState, http) => {
    try {
      const claimedPapers = getState().authors.get(
        'publicationSelectionClaimed'
      );
      const unclaimablePapers = getState().authors.get(
        'publicationSelectionCanNotClaim'
      );
      assigning();
      const { data } = await http.post('/assign/author', {
        from_author_recid: from,
        to_author_recid: to,
        papers_ids_already_claimed: claimedPapers,
        papers_ids_not_matching_name: unclaimablePapers,
      });
      if (Object.prototype.hasOwnProperty.call(data, 'created_rt_ticket')) {
        assignSuccessDifferentProfileClaimedPapers();
      } else {
        assignSuccessDifferentProfileUnclaimedPapers();
      }

      // add timestamp based query to in order to trigger search again
      dispatch(
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: Date.now() })
      );
      dispatch(clearPublicationSelection());
      dispatch(clearPublicationsClaimedSelection());
      dispatch(clearPublicationsCanNotClaimSelection());
    } catch (error) {
      assignError();
    }
  };
}

export function assignDifferentProfileUnclaimedPapers({ from, to }) {
  return async (dispatch, getState, http) => {
    try {
      const unclaimedPapers = getState().authors.get(
        'publicationSelectionUnclaimed'
      );
      const claimedPapers = getState().authors.get(
        'publicationSelectionClaimed'
      );
      assigning();
      await http.post('/assign/author', {
        from_author_recid: from,
        to_author_recid: to,
        literature_recids: unclaimedPapers,
      });
      if (claimedPapers.size === 0) {
        assignSuccessDifferentProfileUnclaimedPapers();
      }
      // add timestamp based query to in order to trigger search again
      dispatch(
        searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, { assigned: Date.now() })
      );
      dispatch(clearPublicationSelection());
      dispatch(clearPublicationsUnclaimedSelection());
    } catch (error) {
      assignError();
    }
  };
}
