import { CALL_HISTORY_METHOD } from 'connected-react-router';
import MockAdapter from 'axios-mock-adapter';

import { getStore } from '../../fixtures/store';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.ts' extension. ... Remove this comment to see the full error message
import http from '../../common/http.ts';
import {
  SUBMIT_ERROR,
  SUBMIT_SUCCESS,
  INITIAL_FORM_DATA_ERROR,
  INITIAL_FORM_DATA_REQUEST,
  INITIAL_FORM_DATA_SUCCESS,
  SUBMIT_REQUEST,
} from '../actionTypes';
import {
  submit,
  submitUpdate,
  fetchUpdateFormData,
  importExternalLiterature,
} from '../submissions';

const mockHttp = new MockAdapter(http.httpClient);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('submissions - async action creator', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    mockHttp.reset();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('submit', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates SUBMIT_SUCCESS and pushes /submissions/success to history if successful', async (done: any) => {
      const submissionUrl = '/submissions/authors';
      const data = { field: 'value' };
      mockHttp.onPost(submissionUrl, { data }).replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: SUBMIT_REQUEST },
        {
          type: SUBMIT_SUCCESS,
          payload: { foo: 'bar' },
        },
        {
          type: CALL_HISTORY_METHOD,
          payload: {
            args: ['/submissions/authors/new/success'],
            method: 'push',
          },
        },
      ];

      const store = getStore();
      await store.dispatch(submit('authors', data));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates SUBMIT_ERROR if not successful', async (done: any) => {
      const submissionUrl = '/submissions/jobs';
      mockHttp.onPost(submissionUrl).replyOnce(400, { message: 'Error' });

      const expectedActions = [
        { type: SUBMIT_REQUEST },
        {
          type: SUBMIT_ERROR,
          payload: {
            error: { message: 'Error', status: 400 },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(submit('jobs', {}));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('submitUpdate', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates SUBMIT_SUCCESS and pushes /submissions/:type/:id/success to history if successful', async (done: any) => {
      const submissionUrl = '/submissions/jobs/123';
      const data = { field: 'value' };
      mockHttp.onPut(submissionUrl, { data }).replyOnce(200, { foo: 'bar' });

      const expectedActions = [
        { type: SUBMIT_REQUEST },
        {
          type: SUBMIT_SUCCESS,
          payload: { foo: 'bar' },
        },
        {
          type: CALL_HISTORY_METHOD,
          payload: { args: ['/submissions/jobs/123/success'], method: 'push' },
        },
      ];

      const store = getStore();
      await store.dispatch(submitUpdate('jobs', '123', data));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates SUBMIT_ERROR if not successful', async (done: any) => {
      const submissionUrl = '/submissions/authors/123';
      mockHttp.onPut(submissionUrl).replyOnce(400, { message: 'Error' });

      const expectedActions = [
        { type: SUBMIT_REQUEST },
        {
          type: SUBMIT_ERROR,
          payload: {
            error: { message: 'Error', status: 400 },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(submitUpdate('authors', '123', {}));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('fetchUpdateFormData', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates INITIAL_FORM_DATA_SUCCESS', async (done: any) => {
      const submissionUrl = '/submissions/authors/123';
      const data = { field: 'value' };
      const meta = { can_access: true };
      mockHttp.onGet(submissionUrl).replyOnce(200, { data, meta });

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
          payload: { data, meta },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchUpdateFormData('authors', '123'));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates INITIAL_FORM_DATA_ERROR if not successful', async (done: any) => {
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
          payload: {
            error: { message: 'Error', status: 404 },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(fetchUpdateFormData('jobs', '123'));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('importExternalLiterature', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates INITIAL_FORM_DATA_SUCCESS', async (done: any) => {
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
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates INITIAL_FORM_DATA_ERROR if not successful', async () => {
      const id = '1234.5678';
      mockHttp
        .onGet(`/literature/import/${id}`)
        .replyOnce(404, { message: 'Error' });

      const expectedActions = [
        {
          type: INITIAL_FORM_DATA_REQUEST,
          payload: { id },
        },
        {
          type: INITIAL_FORM_DATA_ERROR,
          payload: {
            error: { message: 'Error', status: 404 },
          },
        },
      ];

      const store = getStore();
      await store.dispatch(importExternalLiterature(id));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
