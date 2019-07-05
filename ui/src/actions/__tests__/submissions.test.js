import { CALL_HISTORY_METHOD } from 'connected-react-router';
import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
import http from '../../common/http';
import {
  SUBMIT_ERROR,
  SUBMIT_SUCCESS,
  INITIAL_FORM_DATA_ERROR,
  INITIAL_FORM_DATA_REQUEST,
  INITIAL_FORM_DATA_SUCCESS,
} from '../actionTypes';
import {
  submit,
  submitUpdate,
  fetchUpdateFormData,
  importExternalLiterature,
} from '../submissions';

const mockHttp = new MockAdapter(http);

describe('submissions - async action creator', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  describe('submit', () => {
    it('creates SUBMIT_SUCCESS and pushes /submissions/success to history if successful', async done => {
      const submissionUrl = '/submissions/authors';
      const data = { field: 'value' };
      mockHttp.onPost(submissionUrl, { data }).replyOnce(200, {});

      const expectedActions = [
        {
          type: SUBMIT_SUCCESS,
        },
        {
          type: CALL_HISTORY_METHOD,
          payload: { args: ['/submissions/success'], method: 'push' },
        },
      ];

      const store = getStore();
      await store.dispatch(submit('authors', data));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates SUBMIT_ERROR if not successful', async done => {
      const submissionUrl = '/submissions/jobs';
      mockHttp.onPost(submissionUrl).replyOnce(400, { message: 'Error' });

      const expectedActions = [
        {
          type: SUBMIT_ERROR,
          payload: { message: 'Error', status: 400 },
        },
      ];

      const store = getStore();
      await store.dispatch(submit('jobs', {}));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('submitUpdate', () => {
    it('creates SUBMIT_SUCCESS and pushes /submissions/:type/:id/success to history if successful', async done => {
      const submissionUrl = '/submissions/jobs/123';
      const data = { field: 'value' };
      mockHttp.onPut(submissionUrl, { data }).replyOnce(200, {});

      const expectedActions = [
        {
          type: SUBMIT_SUCCESS,
        },
        {
          type: CALL_HISTORY_METHOD,
          payload: { args: ['/submissions/jobs/123/success'], method: 'push' },
        },
      ];

      const store = getStore();
      await store.dispatch(submitUpdate('jobs', '123', data));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates SUBMIT_ERROR if not successful', async done => {
      const submissionUrl = '/submissions/authors/123';
      mockHttp.onPut(submissionUrl).replyOnce(400, { message: 'Error' });

      const expectedActions = [
        {
          type: SUBMIT_ERROR,
          payload: { message: 'Error', status: 400 },
        },
      ];

      const store = getStore();
      await store.dispatch(submitUpdate('authors', '123', {}));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('fetchUpdateFormData', () => {
    it('creates INITIAL_FORM_DATA_SUCCESS', async done => {
      const submissionUrl = '/submissions/authors/123';
      const data = { field: 'value' };
      mockHttp.onGet(submissionUrl, { data }).replyOnce(200, data);

      const expectedActions = [
        {
          type: INITIAL_FORM_DATA_REQUEST,
          payload: {
            pidValue: '123',
            pidType: 'authors',
          },
        },
        {
          type: INITIAL_FORM_DATA_SUCCESS,
          payload: data,
        },
      ];

      const store = getStore();
      await store.dispatch(fetchUpdateFormData('authors', '123'));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates INITIAL_FORM_DATA_ERROR if not successful', async done => {
      const submissionUrl = '/submissions/jobs/123';
      mockHttp.onGet(submissionUrl).replyOnce(404, { message: 'Error' });

      const expectedActions = [
        {
          type: INITIAL_FORM_DATA_REQUEST,
          payload: {
            pidValue: '123',
            pidType: 'jobs',
          },
        },
        {
          type: INITIAL_FORM_DATA_ERROR,
          payload: { message: 'Error', status: 404 },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchUpdateFormData('jobs', '123'));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('importExternalLiterature', () => {
    it('creates INITIAL_FORM_DATA_SUCCESS', async done => {
      const data = { field: 'value' };
      const id = '1234.5678';
      mockHttp.onGet(`/literature/import/${id}`, { data }).replyOnce(200, data);

      const expectedActions = [
        {
          type: INITIAL_FORM_DATA_REQUEST,
          payload: {
            id,
          },
        },
        {
          type: INITIAL_FORM_DATA_SUCCESS,
          payload: data,
        },
      ];

      const store = getStore();
      await store.dispatch(importExternalLiterature(id));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates INITIAL_FORM_DATA_ERROR if not successful', async done => {
      const id = '1234.5678';
      mockHttp
        .onGet(`/literature/import/${id}`)
        .replyOnce(404, { message: 'Error' });

      const expectedActions = [
        {
          type: INITIAL_FORM_DATA_REQUEST,
          payload: {
            id,
          },
        },
        {
          type: INITIAL_FORM_DATA_ERROR,
          payload: { message: 'Error', status: 404 },
        },
      ];

      const store = getStore();
      await store.dispatch(importExternalLiterature(id));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
