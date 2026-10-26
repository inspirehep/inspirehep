import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../recordEditor';
import {
  EDITOR_RESET,
  EDITOR_AUTHOR_ERROR,
  EDITOR_AUTHOR_REQUEST,
  EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR,
  EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST,
  EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS,
  EDITOR_AUTHOR_SUCCESS,
  EDITOR_AUTHOR_REVISIONS_ERROR,
  EDITOR_AUTHOR_REVISIONS_REQUEST,
  EDITOR_AUTHOR_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
  EDITOR_AUTHOR_REVISION_DATA_REQUEST,
  EDITOR_AUTHOR_REVISION_DATA_SUCCESS,
  EDITOR_AUTHOR_REVISION_DATA_ERROR,
  EDITOR_AUTHOR_REVISION_DATA_RESET,
  EDITOR_QUEUES_REQUEST,
  EDITOR_QUEUES_ERROR,
  EDITOR_QUEUES_SUCCESS,
  EDITOR_USERS_REQUEST,
  EDITOR_USERS_ERROR,
  EDITOR_USERS_SUCCESS,
  EDITOR_TICKET_CREATION_REQUEST,
  EDITOR_TICKET_CREATION_SUCCESS,
  EDITOR_TICKET_CREATION_ERROR,
  EDITOR_TICKETS_REQUEST,
  EDITOR_TICKETS_SUCCESS,
  EDITOR_TICKETS_ERROR,
  EDITOR_RESOLVE_TICKET_REQUEST,
  EDITOR_RESOLVE_TICKET_SUCCESS,
  EDITOR_RESOLVE_TICKET_ERROR,
} from '../../actions/actionTypes';

const recordData = (data) => fromJS({ recordData: data });
const tickets = (data) => fromJS({ tickets: data });

describe('recordEditor reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('EDITOR_AUTHOR_REQUEST resets recordData but keeps tickets', () => {
    const currentState = initialState
      .setIn(['recordData', 'author'], fromJS({ metadata: { name: 'old' } }))
      .setIn(['recordData', 'currentRecordETag'], 'old-etag')
      .setIn(['tickets', 'items'], fromJS([{ id: '1' }]))
      .setIn(['tickets', 'queues'], fromJS([{ id: 'q' }]));
    const state = reducer(currentState, { type: EDITOR_AUTHOR_REQUEST });
    expect(state.get('recordData')).toEqual(initialState.get('recordData'));
    expect(state.get('tickets')).toEqual(currentState.get('tickets'));
  });

  it('EDITOR_RESET resets recordData and tickets', () => {
    const currentState = initialState
      .setIn(['recordData', 'author'], fromJS({ metadata: { name: 'old' } }))
      .setIn(['tickets', 'items'], fromJS([{ id: '1' }]));
    const state = reducer(currentState, { type: EDITOR_RESET });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_AUTHOR_SUCCESS', () => {
    const eTag = 'test';
    const payload = {
      data: {
        metadata: {
          name: {
            preferred_name: 'Jessica Jones',
          },
        },
      },
      eTag,
    };
    const currentState = recordData({ author: {} });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_SUCCESS,
      payload,
    });
    const expected = recordData({
      author: payload.data,
      fetchAuthorError: null,
      currentRecordETag: eTag,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_ERROR', () => {
    const currentState = recordData({
      author: { metadata: { control_number: 123 } },
    });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_ERROR,
      payload: { error: { status: 500 } },
    });
    const expected = recordData({
      author: initialState.getIn(['recordData', 'author']),
      fetchAuthorError: 500,
      current_author_revision: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_REVISIONS_REQUEST', () => {
    const state = reducer(initialState, {
      type: EDITOR_AUTHOR_REVISIONS_REQUEST,
      revisionError: null,
    });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_AUTHOR_REVISIONS_SUCCESS', () => {
    const payload = {
      data: [
        {
          updated: 'date1',
          user_email: 'test1@cern.ch',
          revision_id: 1,
          rec_uuid: 'someUuid',
          transaction_id: 100,
        },
        {
          updated: 'date2',
          user_email: 'test2@cern.ch',
          revision_id: 2,
          rec_uuid: 'someUuidBis',
          transaction_id: 200,
        },
      ],
    };
    const currentState = recordData({ author_revisions: [] });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_REVISIONS_SUCCESS,
      payload,
    });
    const expected = recordData({
      author_revisions: [
        {
          updated: 'date1',
          userEmail: 'test1@cern.ch',
          revisionId: 1,
          recUuid: 'someUuid',
          transactionId: 100,
        },
        {
          updated: 'date2',
          userEmail: 'test2@cern.ch',
          revisionId: 2,
          recUuid: 'someUuidBis',
          transactionId: 200,
        },
      ],
      revisionError: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_REVISIONS_ERROR', () => {
    const currentState = recordData({
      author_revisions: [{ rev_id: 1 }],
    });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_REVISIONS_ERROR,
    });
    const expected = recordData({
      author_revisions: initialState.getIn(['recordData', 'author_revisions']),
      revisionError: 'Error while fetching revisions',
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_REVISION_DATA_REQUEST', () => {
    const state = reducer(Map(), {
      type: EDITOR_AUTHOR_REVISION_DATA_REQUEST,
    });
    const expected = recordData({
      current_author_revision: null,
      revisionError: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_REVISION_DATA_SUCCESS', () => {
    const payload = {
      data: { control_number: '100' },
    };
    const currentState = recordData({ current_author_revision: null });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_REVISION_DATA_SUCCESS,
      payload,
    });
    const expected = recordData({
      current_author_revision: payload.data,
      revisionError: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_REVISION_DATA_RESET', () => {
    const currentState = recordData({
      current_author_revision: { control_number: '100' },
      revisionError: null,
    });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_REVISION_DATA_RESET,
    });
    expect(state.getIn(['recordData', 'current_author_revision'])).toBeNull();
  });

  it('EDITOR_AUTHOR_REVISION_DATA_ERROR', () => {
    const currentState = recordData({
      current_author_revision: { control_number: '100' },
    });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_REVISION_DATA_ERROR,
    });
    const expected = recordData({
      current_author_revision: initialState.getIn([
        'recordData',
        'current_author_revision',
      ]),
      revisionError: 'Error while fetching data from revision',
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_SAVE_REQUEST', () => {
    const state = reducer(Map(), { type: EDITOR_AUTHOR_SAVE_REQUEST });
    const expected = recordData({ saveError: null });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_SAVE_SUCCESS', () => {
    const state = reducer(initialState, {
      type: EDITOR_AUTHOR_SAVE_SUCCESS,
    });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_AUTHOR_SAVE_ERROR', () => {
    const errorMessage = ' not working';
    const currentState = recordData({ saveError: null });
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_SAVE_ERROR,
      payload: { error: errorMessage },
    });
    const expected = recordData({
      saveError: errorMessage,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST', () => {
    const state = reducer(initialState, {
      type: EDITOR_AUTHOR_REVERT_TO_REVISION_REQUEST,
    });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS', () => {
    const state = reducer(initialState, {
      type: EDITOR_AUTHOR_REVERT_TO_REVISION_SUCCESS,
    });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR', () => {
    const errorMessage = 'not working';
    const state = reducer(initialState, {
      type: EDITOR_AUTHOR_REVERT_TO_REVISION_ERROR,
      payload: { error: errorMessage },
    });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_QUEUES_REQUEST', () => {
    const state = reducer(
      tickets({ queues: [{ id: '1' }], queuesError: 'old error' }),
      { type: EDITOR_QUEUES_REQUEST }
    );
    const expected = tickets({ queues: [], queuesError: null });
    expect(state).toEqual(expected);
  });

  it('EDITOR_QUEUES_SUCCESS', () => {
    const data = [{ id: '1', name: 'one' }];
    const state = reducer(tickets({ queuesError: 'old error' }), {
      type: EDITOR_QUEUES_SUCCESS,
      payload: { data },
    });
    const expected = tickets({ queues: data, queuesError: null });
    expect(state).toEqual(expected);
  });

  it('EDITOR_QUEUES_ERROR', () => {
    const state = reducer(
      tickets({ queues: [{ id: '1' }], queuesError: null }),
      { type: EDITOR_QUEUES_ERROR, payload: { error: { status: 500 } } }
    );
    const expected = tickets({
      queues: [],
      queuesError: 'Error while fetching queues',
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_USERS_REQUEST', () => {
    const state = reducer(
      tickets({ users: [{ id: '1' }], usersError: 'old error' }),
      { type: EDITOR_USERS_REQUEST }
    );
    const expected = tickets({
      users: [],
      usersError: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_USERS_SUCCESS', () => {
    const data = [{ id: '1', name: 'one' }];
    const state = reducer(tickets({ usersError: 'old error' }), {
      type: EDITOR_USERS_SUCCESS,
      payload: { data },
    });
    const expected = tickets({
      users: data,
      usersError: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_USERS_ERROR', () => {
    const state = reducer(tickets({ users: [{ id: '1' }], usersError: null }), {
      type: EDITOR_USERS_ERROR,
      payload: { error: { status: 500 } },
    });
    const expected = tickets({
      users: [],
      usersError: 'Error while fetching users',
    });
    expect(state).toEqual(expected);
  });

  [
    [EDITOR_TICKET_CREATION_REQUEST, undefined],
    [EDITOR_TICKET_CREATION_SUCCESS, { data: { id: '1' } }],
    [EDITOR_TICKET_CREATION_ERROR, { error: { status: 500 } }],
  ].forEach(([type, payload]) => {
    it(type, () => {
      const initial = tickets({ items: [{ id: '1' }], ticketsError: null });
      expect(reducer(initial, { type, payload })).toEqual(initial);
    });
  });

  it('EDITOR_TICKETS_REQUEST', () => {
    const state = reducer(
      tickets({ items: [{ id: '1' }], ticketsError: 'old error' }),
      { type: EDITOR_TICKETS_REQUEST }
    );
    const expected = tickets({
      items: [{ id: '1' }],
      ticketsError: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_TICKETS_SUCCESS', () => {
    const data = [
      {
        u_functional_category: 'test',
        date: 'some date',
        link: 'test link',
        subject: 'great subject',
        description: 'amazing description',
        sys_id: '123',
      },
    ];
    const state = reducer(tickets({ ticketsError: 'old error' }), {
      type: EDITOR_TICKETS_SUCCESS,
      payload: { data },
    });
    const expected = tickets({
      items: [
        {
          category: 'test',
          date: 'some date',
          link: 'test link',
          subject: 'great subject',
          description: 'amazing description',
          id: '123',
        },
      ],
      ticketsError: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_TICKETS_ERROR', () => {
    const state = reducer(
      tickets({ items: [{ id: '1' }], ticketsError: null }),
      {
        type: EDITOR_TICKETS_ERROR,
        payload: { error: { status: 500 } },
      }
    );
    const expected = tickets({
      items: [],
      ticketsError: 'Error while fetching tickets',
    });
    expect(state).toEqual(expected);
  });

  [
    [EDITOR_RESOLVE_TICKET_REQUEST, undefined],
    [EDITOR_RESOLVE_TICKET_SUCCESS, { data: { id: '1' } }],
    [EDITOR_RESOLVE_TICKET_ERROR, { error: { status: 500 } }],
  ].forEach(([type, payload]) => {
    it(type, () => {
      const initial = tickets({ items: [{ id: '1' }], ticketsError: null });
      expect(reducer(initial, { type, payload })).toEqual(initial);
    });
  });
});
