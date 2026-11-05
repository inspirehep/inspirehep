import MockAdapter from 'axios-mock-adapter';
import { fromJS } from 'immutable';

import http from '../../../common/http';
import { httpClient as backofficeHttpClient } from '../../backoffice';
import { BACKOFFICE_API } from '../../../common/routes';
import {
  EDITOR_AUTHOR_WORKFLOW_ERROR,
  EDITOR_AUTHOR_WORKFLOW_REQUEST,
  EDITOR_AUTHOR_WORKFLOW_SAVE_ERROR,
  EDITOR_AUTHOR_WORKFLOW_SAVE_REQUEST,
  EDITOR_AUTHOR_WORKFLOW_SAVE_SUCCESS,
  EDITOR_AUTHOR_WORKFLOW_SCHEMA_ERROR,
  EDITOR_AUTHOR_WORKFLOW_SCHEMA_REQUEST,
  EDITOR_AUTHOR_WORKFLOW_SCHEMA_SUCCESS,
  EDITOR_AUTHOR_WORKFLOW_SUCCESS,
} from '../../actionTypes';
import { getStore, getState } from '../../../fixtures/store';
import {
  fetchAuthorWorkflow,
  fetchAuthorWorkflowSchema,
  saveAuthorWorkflow,
} from '../../recordEditor/workflow';
import {
  notifyEditionError,
  notifyEditionInProgress,
  notifyEditionSuccess,
} from '../../../recordEditor/notifications';

const mockHttp = new MockAdapter(http.httpClient);
const mockBackofficeHttp = new MockAdapter(backofficeHttpClient);

vi.mock('../../../recordEditor/notifications', () => ({
  notifyEditionInProgress: vi.fn(),
  notifyEditionSuccess: vi.fn(),
  notifyEditionError: vi.fn(),
}));

const workflowUrl = (id) => `${BACKOFFICE_API}/workflows/authors/${id}/`;
const validateUrl = `${BACKOFFICE_API}/workflows/authors/validate/`;
const schemaUrl = 'https://inspirehep.net/schemas/records/authors.json';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  mockHttp.reset();
  mockBackofficeHttp.reset();
});

describe('workflow - async actions creator', () => {
  describe('fetchAuthorWorkflowSchema', () => {
    it('creates EDITOR_AUTHOR_WORKFLOW_SCHEMA_SUCCESS', async () => {
      const schema = { type: 'object' };
      mockHttp.onGet(schemaUrl).replyOnce(200, schema);

      const store = getStore();
      await store.dispatch(fetchAuthorWorkflowSchema(schemaUrl));

      expect(store.getActions()).toEqual([
        { type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_REQUEST },
        {
          type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_SUCCESS,
          payload: { data: schema },
        },
      ]);
    });

    it('creates EDITOR_AUTHOR_WORKFLOW_SCHEMA_ERROR', async () => {
      mockHttp.onGet(schemaUrl).replyOnce(500, { message: 'Error' });

      const store = getStore();
      await store.dispatch(fetchAuthorWorkflowSchema(schemaUrl));

      expect(store.getActions()).toEqual([
        { type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_REQUEST },
        {
          type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_ERROR,
          payload: { error: { status: 500, message: 'Error' } },
        },
      ]);
    });
  });

  describe('fetchAuthorWorkflow', () => {
    it('creates EDITOR_AUTHOR_WORKFLOW_SUCCESS then fetches the schema', async () => {
      const workflow = { id: 'abc', data: { $schema: schemaUrl } };
      const schema = { type: 'object' };
      mockBackofficeHttp.onGet(workflowUrl('abc')).replyOnce(200, workflow);
      mockHttp.onGet(schemaUrl).replyOnce(200, schema);

      const store = getStore();
      await store.dispatch(fetchAuthorWorkflow('abc'));

      expect(store.getActions()).toEqual([
        { type: EDITOR_AUTHOR_WORKFLOW_REQUEST },
        { type: EDITOR_AUTHOR_WORKFLOW_SUCCESS, payload: { data: workflow } },
        { type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_REQUEST },
        {
          type: EDITOR_AUTHOR_WORKFLOW_SCHEMA_SUCCESS,
          payload: { data: schema },
        },
      ]);
    });

    it('creates EDITOR_AUTHOR_WORKFLOW_ERROR and skips the schema', async () => {
      mockBackofficeHttp
        .onGet(workflowUrl('abc'))
        .replyOnce(404, { message: 'Not found' });

      const store = getStore();
      await store.dispatch(fetchAuthorWorkflow('abc'));

      expect(store.getActions()).toEqual([
        { type: EDITOR_AUTHOR_WORKFLOW_REQUEST },
        {
          type: EDITOR_AUTHOR_WORKFLOW_ERROR,
          payload: { error: { status: 404, message: 'Not found' } },
        },
      ]);
      expect(mockHttp.history.get).toHaveLength(0);
    });
  });

  describe('saveAuthorWorkflow', () => {
    const workflow = { name: { value: 'Test' } };

    it('validates then puts merged data and creates EDITOR_AUTHOR_WORKFLOW_SAVE_SUCCESS', async () => {
      const currentAuthor = { id: 'abc', status: 'approval', data: { old: 1 } };
      const saved = { ...currentAuthor, data: workflow };
      mockBackofficeHttp.onPost(validateUrl).replyOnce(200);
      mockBackofficeHttp.onPut(workflowUrl('abc')).replyOnce(200, saved);

      const state = getState();
      const store = getStore({
        recordEditor: state.recordEditor.setIn(
          ['workflowData', 'author'],
          fromJS(currentAuthor)
        ),
      });
      await store.dispatch(saveAuthorWorkflow('abc', workflow));

      expect(store.getActions()).toEqual([
        { type: EDITOR_AUTHOR_WORKFLOW_SAVE_REQUEST },
        { type: EDITOR_AUTHOR_WORKFLOW_SAVE_SUCCESS, payload: { data: saved } },
      ]);
      expect(JSON.parse(mockBackofficeHttp.history.post[0].data)).toEqual(
        workflow
      );
      expect(JSON.parse(mockBackofficeHttp.history.put[0].data)).toEqual(saved);
      expect(notifyEditionInProgress).toHaveBeenCalledWith('abc');
      expect(notifyEditionSuccess).toHaveBeenCalledWith('abc');
      expect(notifyEditionError).not.toHaveBeenCalled();
    });

    it('creates EDITOR_AUTHOR_WORKFLOW_SAVE_ERROR and skips put when validation fails', async () => {
      mockBackofficeHttp
        .onPost(validateUrl)
        .replyOnce(400, { message: 'Invalid' });

      const store = getStore();
      await store.dispatch(saveAuthorWorkflow('abc', workflow));

      expect(store.getActions()).toEqual([
        { type: EDITOR_AUTHOR_WORKFLOW_SAVE_REQUEST },
        {
          type: EDITOR_AUTHOR_WORKFLOW_SAVE_ERROR,
          payload: { error: { status: 400, message: 'Invalid' } },
        },
      ]);
      expect(mockBackofficeHttp.history.put).toHaveLength(0);
      expect(notifyEditionError).toHaveBeenCalledWith('Invalid');
      expect(notifyEditionSuccess).not.toHaveBeenCalled();
    });

    it('creates EDITOR_AUTHOR_WORKFLOW_SAVE_ERROR when put fails', async () => {
      mockBackofficeHttp.onPost(validateUrl).replyOnce(200);
      mockBackofficeHttp.onPut(workflowUrl('abc')).replyOnce(500, {});

      const store = getStore();
      await store.dispatch(saveAuthorWorkflow('abc', workflow));

      expect(store.getActions()).toEqual([
        { type: EDITOR_AUTHOR_WORKFLOW_SAVE_REQUEST },
        {
          type: EDITOR_AUTHOR_WORKFLOW_SAVE_ERROR,
          payload: { error: { status: 500 } },
        },
      ]);
      expect(notifyEditionError).toHaveBeenCalledWith('An error occurred');
    });
  });
});
