import { push } from 'redux-first-history';
import { fromJS } from 'immutable';

import { getStore } from '../../fixtures/store';
import storage from '../../common/storage';
import {
  BACKOFFICE_LOGIN_REQUEST,
  BACKOFFICE_LOGIN_SUCCESS,
  BACKOFFICE_LOGIN_ERROR,
  BACKOFFICE_LOGIN_CHECK,
  BACKOFFICE_LOGOUT_SUCCESS,
  BACKOFFICE_SEARCH_REQUEST,
  BACKOFFICE_SEARCH_SUCCESS,
  BACKOFFICE_SEARCH_ERROR,
  BACKOFFICE_AUTHOR_REQUEST,
  BACKOFFICE_AUTHOR_SUCCESS,
  BACKOFFICE_AUTHOR_ERROR,
  BACKOFFICE_LITERATURE_REQUEST,
  BACKOFFICE_LITERATURE_ERROR,
  BACKOFFICE_BATCH_RESOLVE_ACTION_REQUEST,
  BACKOFFICE_BATCH_RESOLVE_ACTION_SUCCESS,
  BACKOFFICE_BATCH_RESOLVE_ACTION_ERROR,
  BACKOFFICE_BATCH_SUBMITTED_IDS_CLEAR,
  BACKOFFICE_RESTART_ACTION_REQUEST,
  BACKOFFICE_RESTART_ACTION_SUCCESS,
  BACKOFFICE_RESTART_ACTION_ERROR,
  BACKOFFICE_DELETE_REQUEST,
  BACKOFFICE_DELETE_SUCCESS,
  BACKOFFICE_DELETE_ERROR,
  BACKOFFICE_AUTHORS_DASHBOARD_REQUEST,
  BACKOFFICE_LITERATURE_DASHBOARD_REQUEST,
  BACKOFFICE_UPDATE_LITERATURE_REQUEST,
  BACKOFFICE_UPDATE_LITERATURE_SUCCESS,
  BACKOFFICE_UPDATE_LITERATURE_ERROR,
  BACKOFFICE_RESOLVE_ACTION_REQUEST,
  BACKOFFICE_RESOLVE_ACTION_SUCCESS,
  BACKOFFICE_RESOLVE_ACTION_ERROR,
  BACKOFFICE_LITERATURE_SUCCESS,
  BACKOFFICE_SEARCH_QUERY_RESET,
} from '../actionTypes';
import {
  updateLiteratureAction,
  resolveLiteratureAction,
  backofficeLocalLogin,
  backofficeLogout,
  fetchSearchResults,
  fetchAuthor,
  fetchLiteratureRecord,
  resolveLiteratureBatchAction,
  resolveAuthorAction,
  restartWorkflowAction,
  restartCurrentWorkflowAction,
  deleteWorkflow,
  isUserLoggedInToBackoffice,
} from '../backoffice';
import {
  notifyActionError,
  notifyActionSuccess,
  notifyDeleteSuccess,
  notifyDeleteError,
  notifyLoginError,
} from '../../backoffice/notifications';
import { WorkflowActions, WorkflowStatuses } from '../../backoffice/constants';
import {
  BACKOFFICE,
  BACKOFFICE_API,
  BACKOFFICE_LOGIN,
  BACKOFFICE_LOGIN_API,
} from '../../common/routes';
import { AUTHORS_PID_TYPE, LITERATURE_PID_TYPE } from '../../common/constants';

vi.mock('../../common/storage', () => ({
  default: { getSync: vi.fn(), set: vi.fn(), remove: vi.fn() },
}));

const mockAxiosInstance = vi.hoisted(() => ({
  patch: vi.fn(),
  post: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isAxiosError: vi.fn(),
  },
  create: vi.fn(() => mockAxiosInstance),
  isAxiosError: vi.fn(),
}));

vi.mock('../../backoffice/notifications', () => ({
  notifyActionError: vi.fn(),
  notifyActionSuccess: vi.fn(),
  notifyDeleteSuccess: vi.fn(),
  notifyDeleteError: vi.fn(),
  notifyLoginError: vi.fn(),
}));

function makeAxiosError(status: number, data: object) {
  const error = new Error('Request failed');
  (error as any).response = { status, data };
  return error;
}

describe('backoffice - async action creators', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateLiteratureAction', () => {
    it('success - dispatches UPDATE_LITERATURE_SUCCESS and refreshes record', async () => {
      const responseData = { id: 'test-id', status: 'approval' };
      mockAxiosInstance.patch.mockResolvedValueOnce({ data: responseData });

      const id = 'test-id';
      const payload = {
        data: { inspire_categories: [{ term: 'Computing', source: 'arxiv' }] },
        status: WorkflowStatuses.APPROVAL,
      };

      const store = getStore();
      await store.dispatch(updateLiteratureAction(id, payload) as any);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${LITERATURE_PID_TYPE}/${id}/`,
        payload
      );
      expect(store.getActions()).toEqual([
        {
          type: BACKOFFICE_UPDATE_LITERATURE_REQUEST,
          payload: { type: WorkflowActions.UPDATE, id },
        },
        { type: BACKOFFICE_UPDATE_LITERATURE_SUCCESS },
        {
          type: BACKOFFICE_LITERATURE_SUCCESS,
          payload: { data: responseData },
        },
      ]);
      expect(notifyActionSuccess).toHaveBeenCalledWith(WorkflowActions.UPDATE);
    });

    it('error with string message - dispatches UPDATE_LITERATURE_ERROR and notifies', async () => {
      mockAxiosInstance.patch.mockRejectedValueOnce(
        makeAxiosError(400, { error: 'Bad Request' })
      );

      const id = 'test-id';
      const payload = {
        data: { inspire_categories: [] },
        status: WorkflowStatuses.APPROVAL,
      };

      const store = getStore();
      await store.dispatch(updateLiteratureAction(id, payload) as any);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${LITERATURE_PID_TYPE}/${id}/`,
        payload
      );
      expect(store.getActions()).toEqual([
        {
          type: BACKOFFICE_UPDATE_LITERATURE_REQUEST,
          payload: { type: WorkflowActions.UPDATE, id },
        },
        {
          type: BACKOFFICE_UPDATE_LITERATURE_ERROR,
          payload: { status: 400, error: 'Bad Request' },
        },
      ]);
      expect(notifyActionError).toHaveBeenCalledWith('Bad Request');
    });

    it('error with object message - dispatches UPDATE_LITERATURE_ERROR and notifies using detail', async () => {
      mockAxiosInstance.patch.mockRejectedValueOnce(
        makeAxiosError(422, { error: { detail: 'Validation failed' } })
      );

      const id = 'test-id';
      const payload = {
        data: { inspire_categories: [] },
        status: WorkflowStatuses.APPROVAL,
      };

      const store = getStore();
      await store.dispatch(updateLiteratureAction(id, payload) as any);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${LITERATURE_PID_TYPE}/${id}/`,
        payload
      );
      expect(store.getActions()).toEqual([
        {
          type: BACKOFFICE_UPDATE_LITERATURE_REQUEST,
          payload: { type: WorkflowActions.UPDATE, id },
        },
        {
          type: BACKOFFICE_UPDATE_LITERATURE_ERROR,
          payload: { status: 422, error: { detail: 'Validation failed' } },
        },
      ]);
      expect(notifyActionError).toHaveBeenCalledWith('Validation failed');
    });
  });

  describe('resolveLiteratureAction', () => {
    it('success without subjectsPayload - dispatches RESOLVE_ACTION_SUCCESS', async () => {
      const responseData = { id: 'test-id', status: 'completed' };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: responseData });

      const id = 'test-id';
      const payload = { action: 'accept' };

      const store = getStore();
      await store.dispatch(resolveLiteratureAction(id, payload) as any);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${LITERATURE_PID_TYPE}/${id}/resolve/`,
        payload
      );
      expect(store.getActions()).toEqual([
        {
          type: BACKOFFICE_RESOLVE_ACTION_REQUEST,
          payload: { type: WorkflowActions.RESOLVE, id, decision: 'accept' },
        },
        { type: BACKOFFICE_RESOLVE_ACTION_SUCCESS },
        {
          type: BACKOFFICE_LITERATURE_SUCCESS,
          payload: { data: responseData },
        },
      ]);
      expect(notifyActionSuccess).toHaveBeenCalledWith(WorkflowActions.RESOLVE);
    });

    it('error without subjectsPayload - dispatches RESOLVE_ACTION_ERROR and notifies', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        makeAxiosError(500, { error: { detail: 'Internal error' } })
      );

      const id = 'test-id';
      const payload = { action: 'reject' };

      const store = getStore();
      await store.dispatch(resolveLiteratureAction(id, payload) as any);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${LITERATURE_PID_TYPE}/${id}/resolve/`,
        payload
      );
      expect(store.getActions()).toEqual([
        {
          type: BACKOFFICE_RESOLVE_ACTION_REQUEST,
          payload: { type: WorkflowActions.RESOLVE, id, decision: 'reject' },
        },
        {
          type: BACKOFFICE_RESOLVE_ACTION_ERROR,
          payload: { status: 500, error: { detail: 'Internal error' } },
        },
      ]);
      expect(notifyActionError).toHaveBeenCalledWith('Internal error');
    });
  });

  describe('backofficeLocalLogin', () => {
    const credentials = { email: 'a@b.c', password: 'secret' };

    it('success - stores tokens, dispatches LOGIN_SUCCESS and redirects', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        status: 200,
        data: { access: 'acc', refresh: 'ref' },
      });

      const store = getStore();
      await store.dispatch(backofficeLocalLogin(credentials) as any);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        BACKOFFICE_LOGIN_API,
        credentials,
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(storage.set).toHaveBeenCalledWith('backoffice.token', 'acc');
      expect(storage.set).toHaveBeenCalledWith(
        'backoffice.refreshToken',
        'ref'
      );
      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_LOGIN_REQUEST },
        { type: BACKOFFICE_LOGIN_SUCCESS },
        push(BACKOFFICE),
      ]);
    });

    it('error - notifies and dispatches LOGIN_ERROR', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        makeAxiosError(401, { detail: 'Bad credentials' })
      );

      const store = getStore();
      await store.dispatch(backofficeLocalLogin(credentials) as any);

      expect(storage.set).not.toHaveBeenCalled();
      expect(notifyLoginError).toHaveBeenCalledWith('Bad credentials');
      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_LOGIN_REQUEST },
        {
          type: BACKOFFICE_LOGIN_ERROR,
          payload: { error: { status: 401, detail: 'Bad credentials' } },
        },
      ]);
    });
  });

  describe('backofficeLogout', () => {
    it('success - removes tokens, dispatches LOGOUT_SUCCESS and redirects to login', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ status: 200 });

      const store = getStore();
      await store.dispatch(backofficeLogout() as any);

      expect(storage.remove).toHaveBeenCalledWith('backoffice.token');
      expect(storage.remove).toHaveBeenCalledWith('backoffice.refreshToken');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/users/logout/`
      );
      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_LOGOUT_SUCCESS },
        push(BACKOFFICE_LOGIN),
      ]);
    });

    it('error - still dispatches LOGOUT_SUCCESS without redirect', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('boom'));

      const store = getStore();
      await store.dispatch(backofficeLogout() as any);

      expect(storage.remove).toHaveBeenCalledWith('backoffice.token');
      expect(store.getActions()).toEqual([{ type: BACKOFFICE_LOGOUT_SUCCESS }]);
    });
  });

  describe('fetchSearchResults', () => {
    it('success - builds the url from the query, skipping empty values', async () => {
      const responseData = { results: [], count: 0 };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: responseData });

      const store = getStore({
        backoffice: fromJS({
          query: {
            page: 1,
            size: 10,
            search: '',
            status: null,
            ordering: '-a',
          },
        }),
      });
      await store.dispatch(fetchSearchResults(LITERATURE_PID_TYPE) as any);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${LITERATURE_PID_TYPE}/search/?page=1&size=10&ordering=-a`
      );
      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_SEARCH_REQUEST },
        { type: BACKOFFICE_SEARCH_SUCCESS, payload: { data: responseData } },
      ]);
    });

    it('error - dispatches SEARCH_ERROR', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        makeAxiosError(500, { detail: 'oops' })
      );

      const store = getStore({
        backoffice: fromJS({ query: { page: 1 } }),
      });
      await store.dispatch(fetchSearchResults(AUTHORS_PID_TYPE) as any);

      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_SEARCH_REQUEST },
        {
          type: BACKOFFICE_SEARCH_ERROR,
          payload: { error: { status: 500, detail: 'oops' } },
        },
      ]);
    });
  });

  describe('fetchAuthor', () => {
    it('success - dispatches AUTHOR_SUCCESS', async () => {
      const responseData = { id: 'a1' };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: responseData });

      const store = getStore();
      await store.dispatch(fetchAuthor('a1') as any);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/authors/a1/`
      );
      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_AUTHOR_REQUEST },
        { type: BACKOFFICE_AUTHOR_SUCCESS, payload: { data: responseData } },
      ]);
    });

    it('error - dispatches AUTHOR_ERROR', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        makeAxiosError(404, { detail: 'Not found' })
      );

      const store = getStore();
      await store.dispatch(fetchAuthor('a1') as any);

      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_AUTHOR_REQUEST },
        {
          type: BACKOFFICE_AUTHOR_ERROR,
          payload: { error: { status: 404, detail: 'Not found' } },
        },
      ]);
    });
  });

  describe('fetchLiteratureRecord', () => {
    it('success - dispatches LITERATURE_SUCCESS', async () => {
      const responseData = { id: 'l1' };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: responseData });

      const store = getStore();
      await store.dispatch(fetchLiteratureRecord('l1') as any);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${LITERATURE_PID_TYPE}/l1/`
      );
      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_LITERATURE_REQUEST },
        {
          type: BACKOFFICE_LITERATURE_SUCCESS,
          payload: { data: responseData },
        },
      ]);
    });

    it('error - dispatches LITERATURE_ERROR', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        makeAxiosError(404, { detail: 'Not found' })
      );

      const store = getStore();
      await store.dispatch(fetchLiteratureRecord('l1') as any);

      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_LITERATURE_REQUEST },
        {
          type: BACKOFFICE_LITERATURE_ERROR,
          payload: { error: { status: 404, detail: 'Not found' } },
        },
      ]);
    });
  });

  describe('resolveLiteratureBatchAction', () => {
    const payload = { action: 'accept', ids: ['1', '2'] };

    it('success - dispatches BATCH_RESOLVE_ACTION_SUCCESS', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });

      const store = getStore();
      await store.dispatch(resolveLiteratureBatchAction(payload) as any);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${LITERATURE_PID_TYPE}/resolve/`,
        payload
      );
      expect(store.getActions()).toEqual([
        {
          type: BACKOFFICE_BATCH_RESOLVE_ACTION_REQUEST,
          payload: {
            type: WorkflowActions.RESOLVE,
            ids: ['1', '2'],
            decision: 'accept',
          },
        },
        { type: BACKOFFICE_BATCH_RESOLVE_ACTION_SUCCESS },
      ]);
      expect(notifyActionSuccess).toHaveBeenCalledWith(WorkflowActions.RESOLVE);
    });

    it('error - dispatches BATCH_RESOLVE_ACTION_ERROR then clears submitted ids', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        makeAxiosError(400, { error: 'Bad Request' })
      );

      const store = getStore();
      await store.dispatch(resolveLiteratureBatchAction(payload) as any);

      expect(store.getActions()).toEqual([
        {
          type: BACKOFFICE_BATCH_RESOLVE_ACTION_REQUEST,
          payload: {
            type: WorkflowActions.RESOLVE,
            ids: ['1', '2'],
            decision: 'accept',
          },
        },
        {
          type: BACKOFFICE_BATCH_RESOLVE_ACTION_ERROR,
          payload: { status: 400, error: 'Bad Request' },
        },
        { type: BACKOFFICE_BATCH_SUBMITTED_IDS_CLEAR },
      ]);
      expect(notifyActionError).toHaveBeenCalledWith('Bad Request');
    });

    it('defaults ids to an empty list when payload has none', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });

      const store = getStore();
      await store.dispatch(
        resolveLiteratureBatchAction({ action: 'reject' }) as any
      );

      expect(store.getActions()[0]).toEqual({
        type: BACKOFFICE_BATCH_RESOLVE_ACTION_REQUEST,
        payload: { type: WorkflowActions.RESOLVE, ids: [], decision: 'reject' },
      });
    });
  });

  describe('resolveAuthorAction', () => {
    const payload = { value: 'accept' };

    it('success - dispatches RESOLVE_ACTION_SUCCESS and refreshes author', async () => {
      const responseData = { id: 'a1' };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: responseData });

      const store = getStore();
      await store.dispatch(resolveAuthorAction('a1', payload) as any);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${AUTHORS_PID_TYPE}/a1/resolve/`,
        payload
      );
      expect(store.getActions()).toEqual([
        {
          type: BACKOFFICE_RESOLVE_ACTION_REQUEST,
          payload: {
            type: WorkflowActions.RESOLVE,
            id: 'a1',
            decision: 'accept',
          },
        },
        { type: BACKOFFICE_RESOLVE_ACTION_SUCCESS },
        { type: BACKOFFICE_AUTHOR_SUCCESS, payload: { data: responseData } },
      ]);
      expect(notifyActionSuccess).toHaveBeenCalledWith(WorkflowActions.RESOLVE);
    });

    it('error - dispatches RESOLVE_ACTION_ERROR and notifies', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        makeAxiosError(500, { error: { detail: 'Internal error' } })
      );

      const store = getStore();
      await store.dispatch(resolveAuthorAction('a1', payload) as any);

      expect(store.getActions()).toEqual([
        {
          type: BACKOFFICE_RESOLVE_ACTION_REQUEST,
          payload: {
            type: WorkflowActions.RESOLVE,
            id: 'a1',
            decision: 'accept',
          },
        },
        {
          type: BACKOFFICE_RESOLVE_ACTION_ERROR,
          payload: { status: 500, error: { detail: 'Internal error' } },
        },
      ]);
      expect(notifyActionError).toHaveBeenCalledWith('Internal error');
    });
  });

  describe.each([
    [
      'restartWorkflowAction',
      restartWorkflowAction,
      WorkflowActions.RESTART,
      {},
    ],
    [
      'restartCurrentWorkflowAction',
      restartCurrentWorkflowAction,
      WorkflowActions.RESTART_CURRENT,
      { restart_current_task: true },
    ],
  ])('%s', (_name, actionCreator, decision, body) => {
    const requestAction = (id: string) => ({
      type: BACKOFFICE_RESTART_ACTION_REQUEST,
      payload: { type: WorkflowActions.RESTART, id, decision },
    });

    it('success on authors - refreshes author', async () => {
      const responseData = { id: 'a1' };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: responseData });

      const store = getStore();
      await store.dispatch(actionCreator('a1', AUTHORS_PID_TYPE) as any);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${AUTHORS_PID_TYPE}/a1/restart/`,
        body
      );
      expect(store.getActions()).toEqual([
        requestAction('a1'),
        { type: BACKOFFICE_RESTART_ACTION_SUCCESS },
        { type: BACKOFFICE_AUTHOR_SUCCESS, payload: { data: responseData } },
      ]);
      expect(notifyActionSuccess).toHaveBeenCalledWith(WorkflowActions.RESTART);
    });

    it('success on literature - refreshes literature record', async () => {
      const responseData = { id: 'l1' };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: responseData });

      const store = getStore();
      await store.dispatch(actionCreator('l1', LITERATURE_PID_TYPE) as any);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/workflows/${LITERATURE_PID_TYPE}/l1/restart/`,
        body
      );
      expect(store.getActions()).toEqual([
        requestAction('l1'),
        { type: BACKOFFICE_RESTART_ACTION_SUCCESS },
        {
          type: BACKOFFICE_LITERATURE_SUCCESS,
          payload: { data: responseData },
        },
      ]);
    });

    it('success on unknown namespace - no record refresh', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });

      const store = getStore();
      await store.dispatch(actionCreator('x1', 'other') as any);

      expect(store.getActions()).toEqual([
        requestAction('x1'),
        { type: BACKOFFICE_RESTART_ACTION_SUCCESS },
      ]);
    });

    it('error - dispatches RESTART_ACTION_ERROR and notifies', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        makeAxiosError(500, { error: 'Failed' })
      );

      const store = getStore();
      await store.dispatch(actionCreator('a1', AUTHORS_PID_TYPE) as any);

      expect(store.getActions()).toEqual([
        requestAction('a1'),
        {
          type: BACKOFFICE_RESTART_ACTION_ERROR,
          payload: { status: 500, error: 'Failed' },
        },
      ]);
      expect(notifyActionError).toHaveBeenCalledWith('Failed');
    });
  });

  describe('deleteWorkflow', () => {
    it.each([AUTHORS_PID_TYPE, LITERATURE_PID_TYPE])(
      'success on %s - notifies and redirects to its search page',
      async (namespace) => {
        mockAxiosInstance.delete.mockResolvedValueOnce({});

        const store = getStore();
        await store.dispatch(deleteWorkflow(namespace, 'id1') as any);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
          `${BACKOFFICE_API}/workflows/${namespace}/id1/`
        );
        expect(store.getActions()).toEqual([
          { type: BACKOFFICE_DELETE_REQUEST },
          { type: BACKOFFICE_DELETE_SUCCESS },
          push(`${BACKOFFICE}/${namespace}/search`),
        ]);
        expect(notifyDeleteSuccess).toHaveBeenCalled();
      }
    );

    it('success on unknown namespace - no redirect', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({});

      const store = getStore();
      await store.dispatch(deleteWorkflow('other', 'id1') as any);

      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_DELETE_REQUEST },
        { type: BACKOFFICE_DELETE_SUCCESS },
      ]);
    });

    it('error - dispatches DELETE_ERROR and notifies', async () => {
      mockAxiosInstance.delete.mockRejectedValueOnce(
        makeAxiosError(403, { error: { detail: 'Forbidden' } })
      );

      const store = getStore();
      await store.dispatch(deleteWorkflow(AUTHORS_PID_TYPE, 'id1') as any);

      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_DELETE_REQUEST },
        {
          type: BACKOFFICE_DELETE_ERROR,
          payload: { status: 403, error: { detail: 'Forbidden' } },
        },
      ]);
      expect(notifyDeleteError).toHaveBeenCalledWith('Forbidden');
    });
  });

  describe('isUserLoggedInToBackoffice', () => {
    it('success - resets query, loads dashboards and dispatches LOGIN_SUCCESS', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: { facets: {} },
      });

      const store = getStore();
      await store.dispatch(isUserLoggedInToBackoffice() as any);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `${BACKOFFICE_API}/users/me/`
      );
      const types = store.getActions().map((a: { type: string }) => a.type);
      expect(types[0]).toBe(BACKOFFICE_LOGIN_CHECK);
      expect(types).toContain(BACKOFFICE_SEARCH_QUERY_RESET);
      expect(types).toContain(BACKOFFICE_AUTHORS_DASHBOARD_REQUEST);
      expect(types).toContain(BACKOFFICE_LITERATURE_DASHBOARD_REQUEST);
      expect(types).toContain(BACKOFFICE_LOGIN_SUCCESS);

      mockAxiosInstance.get.mockReset();
    });

    it('error - notifies, dispatches LOGIN_ERROR and redirects to login', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(
        makeAxiosError(401, { detail: 'Not authenticated' })
      );

      const store = getStore();
      await store.dispatch(isUserLoggedInToBackoffice() as any);

      expect(notifyLoginError).toHaveBeenCalledWith('Not authenticated');
      expect(store.getActions()).toEqual([
        { type: BACKOFFICE_LOGIN_CHECK },
        {
          type: BACKOFFICE_LOGIN_ERROR,
          payload: { error: { status: 401, detail: 'Not authenticated' } },
        },
        push(BACKOFFICE_LOGIN),
      ]);
    });
  });
});
