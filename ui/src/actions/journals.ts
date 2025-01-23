import { JOURNAL_REQUEST, JOURNAL_SUCCESS, JOURNAL_ERROR } from './actionTypes';
import { JOURNALS_PID_TYPE } from '../common/constants';
import { generateRecordFetchAction } from './recordsFactory';

const fetchJournal = generateRecordFetchAction({
  pidType: JOURNALS_PID_TYPE,
  fetchingActionActionType: JOURNAL_REQUEST,
  fetchSuccessActionType: JOURNAL_SUCCESS,
  fetchErrorActionType: JOURNAL_ERROR,
});

export default fetchJournal;
