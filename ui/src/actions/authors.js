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
import { assignSuccess, assignError } from '../authors/assignNotification';
import { searchQueryUpdate } from './search';
import { AUTHOR_PUBLICATIONS_NS } from '../search/constants';

const fetchAuthor = generateRecordFetchAction({
  pidType: AUTHORS_PID_TYPE,
  fetchingActionActionType: AUTHOR_REQUEST,
  fecthSuccessActionType: AUTHOR_SUCCESS,
  fetchErrorActionType: AUTHOR_ERROR,
});

export default fetchAuthor;

export function setPulicationSelection(publicationIds, selected) {
  return {
    type: AUTHOR_PUBLICATION_SELECTION_SET,
    payload: { publicationIds, selected },
  };
}

export function clearPulicationSelection() {
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
      const { data } = await http.post('/assign', {
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
      dispatch(clearPulicationSelection());
      dispatch(setAssignDrawerVisibility(false));
    } catch (error) {
      assignError();
    }
  };
}
