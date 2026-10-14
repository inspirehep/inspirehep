import { fromJS } from 'immutable';
import {
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_SUCCESS,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
  EDITOR_AUTHOR_REVISION_DATA_REQUEST,
  EDITOR_AUTHOR_REVISION_DATA_ERROR,
  EDITOR_AUTHOR_REVISION_DATA_SUCCESS,
  EDITOR_AUTHOR_REVISION_DATA_RESET,
  EDITOR_QUEUES_REQUEST,
  EDITOR_QUEUES_ERROR,
  EDITOR_QUEUES_SUCCESS,
  EDITOR_TICKETS_ERROR,
  EDITOR_TICKETS_REQUEST,
  EDITOR_TICKETS_SUCCESS,
  EDITOR_USERS_ERROR,
  EDITOR_USERS_REQUEST,
  EDITOR_USERS_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  author: {},
  author_revisions: [],
  current_author_revision: null,
  revisionError: null,
  saveError: null,
  fetchAuthorError: null,
  currentRecordETag: null,
  queues: [],
  users: [],
  queuesError: null,
  usersError: null,
  tickets: [],
  ticketsError: null,
});

const RecordEditorReducer = (state = initialState, action) => {
  switch (action.type) {
    case EDITOR_AUTHOR_REQUEST:
      return initialState;
    case EDITOR_AUTHOR_ERROR:
      return state
        .set('author', initialState.get('author'))
        .set('fetchAuthorError', action.payload.error.status)
        .set('current_author_revision', null);
    case EDITOR_AUTHOR_SUCCESS:
      return state
        .set('author', fromJS(action.payload.data))
        .set('currentRecordETag', fromJS(action.payload.eTag))
        .set('fetchAuthorError', null);
    case EDITOR_AUTHOR_REVISIONS_REQUEST:
      return state
        .set('author_revisions', initialState.get('author_revisions'))
        .set('revisionError', null);
    case EDITOR_AUTHOR_REVISIONS_ERROR:
      return state
        .set('author_revisions', initialState.get('author_revisions'))
        .set('revisionError', 'Error while fetching revisions');
    case EDITOR_AUTHOR_REVISIONS_SUCCESS:
      return state
        .set('author_revisions', fromJS(action.payload.data))
        .set('revisionError', null);
    case EDITOR_AUTHOR_REVISION_DATA_REQUEST:
      return state
        .set(
          'current_author_revision',
          initialState.get('current_author_revision')
        )
        .set('revisionError', null);
    case EDITOR_AUTHOR_REVISION_DATA_ERROR:
      return state
        .set(
          'current_author_revision',
          initialState.get('current_author_revision')
        )
        .set('revisionError', 'Error while fetching data from revision');
    case EDITOR_AUTHOR_REVISION_DATA_SUCCESS:
      return state
        .set('current_author_revision', fromJS(action.payload.data))
        .set('revisionError', null);
    case EDITOR_AUTHOR_REVISION_DATA_RESET:
      return state.set(
        'current_author_revision',
        initialState.get('current_author_revision')
      );
    case EDITOR_AUTHOR_SAVE_REQUEST:
      return state.set('saveError', initialState.get('saveError'));
    case EDITOR_AUTHOR_SAVE_SUCCESS:
      return state;
    case EDITOR_AUTHOR_SAVE_ERROR:
      return state.set('saveError', fromJS(action.payload.error));
    case EDITOR_QUEUES_REQUEST:
      return state
        .set('queues', initialState.get('queues'))
        .set('queuesError', null);
    case EDITOR_QUEUES_ERROR:
      return state
        .set('queues', initialState.get('queues'))
        .set('queuesError', 'Error while fetching queues');
    case EDITOR_QUEUES_SUCCESS:
      return state
        .set('queues', fromJS(action.payload.data))
        .set('queuesError', null);
    case EDITOR_USERS_REQUEST:
      return state
        .set('users', initialState.get('users'))
        .set('usersError', null);
    case EDITOR_USERS_ERROR:
      return state
        .set('users', initialState.get('users'))
        .set('usersError', 'Error while fetching users');
    case EDITOR_USERS_SUCCESS:
      return state
        .set('users', fromJS(action.payload.data))
        .set('usersError', null);
    case EDITOR_TICKETS_REQUEST:
      return state.set('ticketsError', null);
    case EDITOR_TICKETS_ERROR:
      return state
        .set('tickets', initialState.get('tickets'))
        .set('ticketsError', 'Error while fetching tickets');
    case EDITOR_TICKETS_SUCCESS:
      return state
        .set('tickets', fromJS(action.payload.data))
        .set('ticketsError', null);
    default:
      return state;
  }
};

export default RecordEditorReducer;
