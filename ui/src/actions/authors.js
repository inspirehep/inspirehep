import {
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  AUTHOR_ERROR,
  AUTHOR_PUBLICATION_SELECTION_CLEAR,
  AUTHOR_PUBLICATION_SELECTION_SET,
  AUTHOR_SET_ASSIGN_DRAWER_VISIBILITY,
} from './actionTypes';
import generateRecordFetchAction from './recordsFactory';
import { AUTHORS_PID_TYPE } from '../common/constants';
import {
  assignSuccess,
  assignError,
  assigning,
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
