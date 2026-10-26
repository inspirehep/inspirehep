import { fromJS } from 'immutable';
import {
  EDITOR_RESET,
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
import { toRevision, toTicket } from '../recordEditor/types';

export const initialState = fromJS({
  recordData: {
    author: {},
    author_revisions: [],
    current_author_revision: null,
    revisionError: null,
    saveError: null,
    fetchAuthorError: null,
    currentRecordETag: null,
  },
  tickets: {
    queues: [],
    users: [],
    queuesError: null,
    usersError: null,
    items: [],
    ticketsError: null,
  },
});

const RecordEditorReducer = (state = initialState, action) => {
  switch (action.type) {
    case EDITOR_RESET:
      return initialState;
    case EDITOR_AUTHOR_REQUEST:
      return state.set('recordData', initialState.get('recordData'));
    case EDITOR_AUTHOR_ERROR:
      return state
        .setIn(
          ['recordData', 'author'],
          initialState.getIn(['recordData', 'author'])
        )
        .setIn(['recordData', 'fetchAuthorError'], action.payload.error.status)
        .setIn(['recordData', 'current_author_revision'], null);
    case EDITOR_AUTHOR_SUCCESS:
      return state
        .setIn(['recordData', 'author'], fromJS(action.payload.data))
        .setIn(['recordData', 'currentRecordETag'], fromJS(action.payload.eTag))
        .setIn(['recordData', 'fetchAuthorError'], null);
    case EDITOR_AUTHOR_REVISIONS_REQUEST:
      return state
        .setIn(
          ['recordData', 'author_revisions'],
          initialState.getIn(['recordData', 'author_revisions'])
        )
        .setIn(['recordData', 'revisionError'], null);
    case EDITOR_AUTHOR_REVISIONS_ERROR:
      return state
        .setIn(
          ['recordData', 'author_revisions'],
          initialState.getIn(['recordData', 'author_revisions'])
        )
        .setIn(
          ['recordData', 'revisionError'],
          'Error while fetching revisions'
        );
    case EDITOR_AUTHOR_REVISIONS_SUCCESS:
      return state
        .setIn(
          ['recordData', 'author_revisions'],
          fromJS(action.payload.data.map((revision) => toRevision(revision)))
        )
        .setIn(['recordData', 'revisionError'], null);
    case EDITOR_AUTHOR_REVISION_DATA_REQUEST:
      return state
        .setIn(
          ['recordData', 'current_author_revision'],
          initialState.getIn(['recordData', 'current_author_revision'])
        )
        .setIn(['recordData', 'revisionError'], null);
    case EDITOR_AUTHOR_REVISION_DATA_ERROR:
      return state
        .setIn(
          ['recordData', 'current_author_revision'],
          initialState.getIn(['recordData', 'current_author_revision'])
        )
        .setIn(
          ['recordData', 'revisionError'],
          'Error while fetching data from revision'
        );
    case EDITOR_AUTHOR_REVISION_DATA_SUCCESS:
      return state
        .setIn(
          ['recordData', 'current_author_revision'],
          fromJS(action.payload.data)
        )
        .setIn(['recordData', 'revisionError'], null);
    case EDITOR_AUTHOR_REVISION_DATA_RESET:
      return state.setIn(
        ['recordData', 'current_author_revision'],
        initialState.getIn(['recordData', 'current_author_revision'])
      );
    case EDITOR_AUTHOR_SAVE_REQUEST:
      return state.setIn(
        ['recordData', 'saveError'],
        initialState.getIn(['recordData', 'saveError'])
      );
    case EDITOR_AUTHOR_SAVE_SUCCESS:
      return state;
    case EDITOR_AUTHOR_SAVE_ERROR:
      return state.setIn(
        ['recordData', 'saveError'],
        fromJS(action.payload.error)
      );
    case EDITOR_QUEUES_REQUEST:
      return state
        .setIn(['tickets', 'queues'], initialState.getIn(['tickets', 'queues']))
        .setIn(['tickets', 'queuesError'], null);
    case EDITOR_QUEUES_ERROR:
      return state
        .setIn(['tickets', 'queues'], initialState.getIn(['tickets', 'queues']))
        .setIn(['tickets', 'queuesError'], 'Error while fetching queues');
    case EDITOR_QUEUES_SUCCESS:
      return state
        .setIn(['tickets', 'queues'], fromJS(action.payload.data))
        .setIn(['tickets', 'queuesError'], null);
    case EDITOR_USERS_REQUEST:
      return state
        .setIn(['tickets', 'users'], initialState.getIn(['tickets', 'users']))
        .setIn(['tickets', 'usersError'], null);
    case EDITOR_USERS_ERROR:
      return state
        .setIn(['tickets', 'users'], initialState.getIn(['tickets', 'users']))
        .setIn(['tickets', 'usersError'], 'Error while fetching users');
    case EDITOR_USERS_SUCCESS:
      return state
        .setIn(['tickets', 'users'], fromJS(action.payload.data))
        .setIn(['tickets', 'usersError'], null);
    case EDITOR_TICKETS_REQUEST:
      return state.setIn(['tickets', 'ticketsError'], null);
    case EDITOR_TICKETS_ERROR:
      return state
        .setIn(['tickets', 'items'], initialState.getIn(['tickets', 'items']))
        .setIn(['tickets', 'ticketsError'], 'Error while fetching tickets');
    case EDITOR_TICKETS_SUCCESS:
      return state
        .setIn(
          ['tickets', 'items'],
          fromJS(action.payload.data.map((ticket) => toTicket(ticket)))
        )
        .setIn(['tickets', 'ticketsError'], null);
    default:
      return state;
  }
};

export default RecordEditorReducer;
