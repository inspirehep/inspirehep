import { getStore } from '../../fixtures/store';
import {
  BACKOFFICE_UPDATE_LITERATURE_REQUEST,
  BACKOFFICE_UPDATE_LITERATURE_SUCCESS,
  BACKOFFICE_UPDATE_LITERATURE_ERROR,
  BACKOFFICE_RESOLVE_ACTION_REQUEST,
  BACKOFFICE_RESOLVE_ACTION_SUCCESS,
  BACKOFFICE_RESOLVE_ACTION_ERROR,
  BACKOFFICE_LITERATURE_SUCCESS,
} from '../actionTypes';
import { updateLiteratureAction, resolveLiteratureAction } from '../backoffice';
import {
  notifyActionError,
  notifyActionSuccess,
} from '../../backoffice/notifications';
import { WorkflowActions, WorkflowStatuses } from '../../backoffice/constants';
import { BACKOFFICE_API } from '../../common/routes';
import { LITERATURE_PID_TYPE } from '../../common/constants';

const mockAxiosInstance = vi.hoisted(() => ({
  patch: vi.fn(),
  post: vi.fn(),
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
});
