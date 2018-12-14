import { CALL_HISTORY_METHOD } from 'react-router-redux';
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
  submitAuthor,
  submitAuthorUpdate,
  fetchAuthorUpdateFormData,
} from '../submissions';

const mockHttp = new MockAdapter(http);

describe('submissions - async action creator', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  describe('submitAuthor', () => {
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
      await store.dispatch(submitAuthor(data));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates SUBMIT_ERROR if not successful', async done => {
      const submissionUrl = '/submissions/authors';
      mockHttp.onPost(submissionUrl).replyOnce(400, { message: 'Error' });

      const expectedActions = [
        {
          type: SUBMIT_ERROR,
          payload: { message: 'Error' },
        },
      ];

      const store = getStore();
      await store.dispatch(submitAuthor({}));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('submitAuthorUpdate', () => {
    it('creates SUBMIT_SUCCESS and pushes /submissions/success to history if successful', async done => {
      const submissionUrl = '/submissions/authors/123';
      const data = { field: 'value' };
      mockHttp.onPut(submissionUrl, { data }).replyOnce(200, {});

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
      await store.dispatch(submitAuthorUpdate(data, '123'));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates AUTHOR_SUBMIT_ERROR if not successful', async done => {
      const submissionUrl = '/submissions/authors/123';
      mockHttp.onPut(submissionUrl).replyOnce(400, { message: 'Error' });

      const expectedActions = [
        {
          type: SUBMIT_ERROR,
          payload: { message: 'Error' },
        },
      ];

      const store = getStore();
      await store.dispatch(submitAuthorUpdate({}, '123'));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  describe('fetchAuthorUpdateFormData', () => {
    it('creates INITIAL_FORM_DATA_SUCCESS', async done => {
      const submissionUrl = '/submissions/authors/123';
      const data = { field: 'value' };
      mockHttp.onGet(submissionUrl, { data }).replyOnce(200, data);

      const expectedActions = [
        {
          type: INITIAL_FORM_DATA_REQUEST,
          payload: {
            recordId: '123',
            pidType: 'authors',
          },
        },
        {
          type: INITIAL_FORM_DATA_SUCCESS,
          payload: data,
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthorUpdateFormData('123'));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    it('creates AUTHOR_UPDATE_FORM_DATA_ERROR if not successful', async done => {
      const submissionUrl = '/submissions/authors/123';
      mockHttp.onGet(submissionUrl).replyOnce(404, { message: 'Error' });

      const expectedActions = [
        {
          type: INITIAL_FORM_DATA_REQUEST,
          payload: {
            recordId: '123',
            pidType: 'authors',
          },
        },
        {
          type: INITIAL_FORM_DATA_ERROR,
          payload: { message: 'Error' },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchAuthorUpdateFormData('123'));
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });
});
