import { Map, fromJS } from 'immutable';

import reducer, { initialState } from '../editor';
import {
  EDITOR_RESET,
  EDITOR_RECORD_ERROR,
  EDITOR_RECORD_REQUEST,
  EDITOR_RECORD_REVERT_TO_REVISION_ERROR,
  EDITOR_RECORD_REVERT_TO_REVISION_REQUEST,
  EDITOR_RECORD_REVERT_TO_REVISION_SUCCESS,
  EDITOR_RECORD_SUCCESS,
  EDITOR_RECORD_REVISIONS_ERROR,
  EDITOR_RECORD_REVISIONS_REQUEST,
  EDITOR_RECORD_REVISIONS_SUCCESS,
  EDITOR_AUTHOR_SAVE_REQUEST,
  EDITOR_AUTHOR_SAVE_SUCCESS,
  EDITOR_AUTHOR_SAVE_ERROR,
  EDITOR_RECORD_REVISION_DATA_REQUEST,
  EDITOR_RECORD_REVISION_DATA_SUCCESS,
  EDITOR_RECORD_REVISION_DATA_ERROR,
  EDITOR_RECORD_REVISION_DATA_RESET,
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
  EDITOR_AUTHOR_WORKFLOW_REQUEST,
  EDITOR_AUTHOR_WORKFLOW_ERROR,
  EDITOR_AUTHOR_WORKFLOW_SUCCESS,
  EDITOR_AUTHOR_WORKFLOW_SCHEMA_REQUEST,
  EDITOR_AUTHOR_WORKFLOW_SCHEMA_ERROR,
  EDITOR_AUTHOR_WORKFLOW_SCHEMA_SUCCESS,
  EDITOR_AUTHOR_WORKFLOW_SAVE_REQUEST,
  EDITOR_AUTHOR_WORKFLOW_SAVE_ERROR,
  EDITOR_AUTHOR_WORKFLOW_SAVE_SUCCESS,
} from '../../actions/actionTypes';

const recordData = (data) => fromJS({ recordData: data });
const tickets = (data) => fromJS({ tickets: data });

describe('editor reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('EDITOR_RECORD_REQUEST resets recordData but keeps tickets', () => {
    const currentState = initialState
      .setIn(['recordData', 'record'], fromJS({ metadata: { name: 'old' } }))
      .setIn(['recordData', 'currentRecordETag'], 'old-etag')
      .setIn(['tickets', 'items'], fromJS([{ id: '1' }]))
      .setIn(['tickets', 'queues'], fromJS([{ id: 'q' }]));
    const state = reducer(currentState, { type: EDITOR_RECORD_REQUEST });
    expect(state.get('recordData')).toEqual(initialState.get('recordData'));
    expect(state.get('tickets')).toEqual(currentState.get('tickets'));
  });

  it('EDITOR_RESET resets recordData and tickets', () => {
    const currentState = initialState
      .setIn(['recordData', 'record'], fromJS({ metadata: { name: 'old' } }))
      .setIn(['tickets', 'items'], fromJS([{ id: '1' }]));
    const state = reducer(currentState, { type: EDITOR_RESET });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_RECORD_SUCCESS', () => {
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
    const currentState = recordData({ record: {} });
    const state = reducer(currentState, {
      type: EDITOR_RECORD_SUCCESS,
      payload,
    });
    const expected = recordData({
      record: payload.data,
      fetchRecordError: null,
      currentRecordETag: eTag,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_RECORD_ERROR', () => {
    const currentState = recordData({
      record: { metadata: { control_number: 123 } },
    });
    const state = reducer(currentState, {
      type: EDITOR_RECORD_ERROR,
      payload: { error: { status: 500 } },
    });
    const expected = recordData({
      record: initialState.getIn(['recordData', 'record']),
      fetchRecordError: 500,
      current_record_revision: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_RECORD_REVISIONS_REQUEST', () => {
    const state = reducer(initialState, {
      type: EDITOR_RECORD_REVISIONS_REQUEST,
      revisionError: null,
    });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_RECORD_REVISIONS_SUCCESS', () => {
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
    const currentState = recordData({ record_revisions: [] });
    const state = reducer(currentState, {
      type: EDITOR_RECORD_REVISIONS_SUCCESS,
      payload,
    });
    const expected = recordData({
      record_revisions: [
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

  it('EDITOR_RECORD_REVISIONS_ERROR', () => {
    const currentState = recordData({
      record_revisions: [{ rev_id: 1 }],
    });
    const state = reducer(currentState, {
      type: EDITOR_RECORD_REVISIONS_ERROR,
    });
    const expected = recordData({
      record_revisions: initialState.getIn(['recordData', 'record_revisions']),
      revisionError: 'Error while fetching revisions',
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_RECORD_REVISION_DATA_REQUEST', () => {
    const state = reducer(Map(), {
      type: EDITOR_RECORD_REVISION_DATA_REQUEST,
    });
    const expected = recordData({
      current_record_revision: null,
      revisionError: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_RECORD_REVISION_DATA_SUCCESS', () => {
    const payload = {
      data: { control_number: '100' },
    };
    const currentState = recordData({ current_record_revision: null });
    const state = reducer(currentState, {
      type: EDITOR_RECORD_REVISION_DATA_SUCCESS,
      payload,
    });
    const expected = recordData({
      current_record_revision: payload.data,
      revisionError: null,
    });
    expect(state).toEqual(expected);
  });

  it('EDITOR_RECORD_REVISION_DATA_RESET', () => {
    const currentState = recordData({
      current_record_revision: { control_number: '100' },
      revisionError: null,
    });
    const state = reducer(currentState, {
      type: EDITOR_RECORD_REVISION_DATA_RESET,
    });
    expect(state.getIn(['recordData', 'current_record_revision'])).toBeNull();
  });

  it('EDITOR_RECORD_REVISION_DATA_ERROR', () => {
    const currentState = recordData({
      current_record_revision: { control_number: '100' },
    });
    const state = reducer(currentState, {
      type: EDITOR_RECORD_REVISION_DATA_ERROR,
    });
    const expected = recordData({
      current_record_revision: initialState.getIn([
        'recordData',
        'current_record_revision',
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

  it('EDITOR_RECORD_REVERT_TO_REVISION_REQUEST', () => {
    const state = reducer(initialState, {
      type: EDITOR_RECORD_REVERT_TO_REVISION_REQUEST,
    });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_RECORD_REVERT_TO_REVISION_SUCCESS', () => {
    const state = reducer(initialState, {
      type: EDITOR_RECORD_REVERT_TO_REVISION_SUCCESS,
    });
    expect(state).toEqual(initialState);
  });

  it('EDITOR_RECORD_REVERT_TO_REVISION_ERROR', () => {
    const errorMessage = 'not working';
    const state = reducer(initialState, {
      type: EDITOR_RECORD_REVERT_TO_REVISION_ERROR,
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

  const workflow = initialState.get('workflowData');

  it('EDITOR_AUTHOR_WORKFLOW_REQUEST resets workflowData but keeps recordData', () => {
    const currentState = initialState
      .setIn(['workflowData', 'author'], fromJS({ name: 'old' }))
      .setIn(['workflowData', 'schema'], fromJS({ type: 'object' }))
      .setIn(['workflowData', 'saveError'], fromJS({ message: 'x' }))
      .setIn(['workflowData', 'fetchAuthorError'], 404)
      .setIn(['workflowData', 'fetchSchemaError'], 500)
      .setIn(['recordData', 'currentRecordETag'], 'etag');
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_WORKFLOW_REQUEST,
    });
    expect(state.get('workflowData')).toEqual(workflow);
    expect(state.get('recordData')).toEqual(currentState.get('recordData'));
  });

  it('EDITOR_AUTHOR_WORKFLOW_SUCCESS', () => {
    const data = { metadata: { name: { value: 'Jones, Jessica' } } };
    const currentState = initialState.setIn(
      ['workflowData', 'fetchAuthorError'],
      404
    );
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_WORKFLOW_SUCCESS,
      payload: { data },
    });
    expect(state.getIn(['workflowData', 'author'])).toEqual(fromJS(data));
    expect(state.getIn(['workflowData', 'fetchAuthorError'])).toBeNull();
  });

  it('EDITOR_AUTHOR_WORKFLOW_ERROR', () => {
    const currentState = initialState.setIn(
      ['workflowData', 'author'],
      fromJS({ name: 'old' })
    );
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_WORKFLOW_ERROR,
      payload: { error: { status: 404 } },
    });
    expect(state.getIn(['workflowData', 'author'])).toEqual(Map());
    expect(state.getIn(['workflowData', 'fetchAuthorError'])).toEqual(404);
  });

  it('EDITOR_AUTHOR_WORKFLOW_SCHEMA_REQUEST', () => {
    const currentState = initialState
      .setIn(['workflowData', 'schema'], fromJS({ type: 'object' }))
      .setIn(['workflowData', 'fetchSchemaError'], 500);
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_REQUEST,
    });
    expect(state.getIn(['workflowData', 'schema'])).toBeNull();
    expect(state.getIn(['workflowData', 'fetchSchemaError'])).toBeNull();
  });

  it('EDITOR_AUTHOR_WORKFLOW_SCHEMA_SUCCESS', () => {
    const data = { type: 'object', properties: { name: {} } };
    const currentState = initialState.setIn(
      ['workflowData', 'fetchSchemaError'],
      500
    );
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_SUCCESS,
      payload: { data },
    });
    expect(state.getIn(['workflowData', 'schema'])).toEqual(fromJS(data));
    expect(state.getIn(['workflowData', 'fetchSchemaError'])).toBeNull();
  });

  it('EDITOR_AUTHOR_WORKFLOW_SCHEMA_ERROR', () => {
    const currentState = initialState.setIn(
      ['workflowData', 'schema'],
      fromJS({ type: 'object' })
    );
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_ERROR,
      payload: { error: { status: 500 } },
    });
    expect(state.getIn(['workflowData', 'schema'])).toBeNull();
    expect(state.getIn(['workflowData', 'fetchSchemaError'])).toEqual(500);
  });

  it('EDITOR_AUTHOR_WORKFLOW_SAVE_REQUEST clears saveError only', () => {
    const currentState = initialState
      .setIn(['workflowData', 'saveError'], fromJS({ message: 'x' }))
      .setIn(['workflowData', 'author'], fromJS({ name: 'kept' }));
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_WORKFLOW_SAVE_REQUEST,
    });
    expect(state.getIn(['workflowData', 'saveError'])).toBeNull();
    expect(state.getIn(['workflowData', 'author'])).toEqual(
      fromJS({ name: 'kept' })
    );
  });

  it('EDITOR_AUTHOR_WORKFLOW_SAVE_SUCCESS', () => {
    const data = { metadata: { name: { value: 'Updated' } } };
    const currentState = initialState.setIn(
      ['workflowData', 'fetchAuthorError'],
      404
    );
    const state = reducer(currentState, {
      type: EDITOR_AUTHOR_WORKFLOW_SAVE_SUCCESS,
      payload: { data },
    });
    expect(state.getIn(['workflowData', 'author'])).toEqual(fromJS(data));
    expect(state.getIn(['workflowData', 'fetchAuthorError'])).toBeNull();
  });

  it('EDITOR_AUTHOR_WORKFLOW_SAVE_ERROR', () => {
    const error = { status: 400, message: 'Invalid' };
    const state = reducer(initialState, {
      type: EDITOR_AUTHOR_WORKFLOW_SAVE_ERROR,
      payload: { error },
    });
    expect(state.getIn(['workflowData', 'saveError'])).toEqual(fromJS(error));
  });
});
