import React from 'react';
import { shallow } from 'enzyme';

import { getStore } from '../../../../fixtures/store';
import { AUTHOR_UPDATE_FORM_DATA_REQUEST } from '../../../../actions/actionTypes';
import AuthorUpdateSubmissionPage from '../AuthorUpdateSubmissionPage';

describe('AuthorUpdateSubmissionPage', () => {
  it('dispatches author update form data request action', () => {
    const store = getStore();
    const matchProps = {
      params: {
        id: '123',
      },
    };
    shallow(
      <AuthorUpdateSubmissionPage match={matchProps} store={store} />
    ).dive();
    const actions = store.getActions();
    const expectedAction = actions.find(
      action => action.type === AUTHOR_UPDATE_FORM_DATA_REQUEST
    );
    expect(expectedAction).toBeDefined();
    expect(expectedAction.payload).toEqual({ recordId: '123' });
  });

  it('dispatches author update form data request action again when match props changed', () => {
    const initalMatchProps = {
      params: {
        id: '123',
      },
    };
    const store = getStore();
    const wrapper = shallow(
      <AuthorUpdateSubmissionPage match={initalMatchProps} store={store} />
    ).dive();
    wrapper.setProps({ match: { params: { id: '999' } } });
    const actions = store.getActions();
    const expectedAction = actions.find(
      action =>
        action.type === AUTHOR_UPDATE_FORM_DATA_REQUEST &&
        action.payload.recordId === '999'
    );
    expect(expectedAction).toBeDefined();
  });

  it('does not dispatches author update form data request action again when match props changed but recordId is same', () => {
    const initalMatchProps = {
      params: {
        id: '123',
      },
    };
    const store = getStore();
    const wrapper = shallow(
      <AuthorUpdateSubmissionPage match={initalMatchProps} store={store} />
    ).dive();
    wrapper.setProps({ match: { params: { id: '123' } } });
    const actions = store.getActions();
    const expectedActions = actions.filter(
      action =>
        action.type === AUTHOR_UPDATE_FORM_DATA_REQUEST &&
        action.payload.recordId === '123'
    );
    expect(expectedActions.length).toBe(1);
  });

  // FIXME: assert that dispatches submit request to update the author onSubmit
});
