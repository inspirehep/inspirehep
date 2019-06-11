import React from 'react';
import { shallow } from 'enzyme';

import { getStore } from '../../../../fixtures/store';
import { INITIAL_FORM_DATA_REQUEST } from '../../../../actions/actionTypes';
import JobUpdateSubmissionPage from '../JobUpdateSubmissionPage';

describe('jobUpdateSubmissionPage', () => {
  it('dispatches job update form data request action', () => {
    const store = getStore();
    const matchProps = {
      params: {
        id: '123',
      },
    };
    shallow(
      <JobUpdateSubmissionPage match={matchProps} store={store} />
    ).dive();
    const actions = store.getActions();
    const expectedAction = actions.find(
      action => action.type === INITIAL_FORM_DATA_REQUEST
    );
    expect(expectedAction).toBeDefined();
    expect(expectedAction.payload).toEqual({
      pidValue: '123',
      pidType: 'jobs',
    });
  });

  it('dispatches job update form data request action again when match props changed', () => {
    const initalMatchProps = {
      params: {
        id: '123',
      },
    };
    const store = getStore();
    const wrapper = shallow(
      <JobUpdateSubmissionPage match={initalMatchProps} store={store} />
    ).dive();
    wrapper.setProps({ match: { params: { id: '999' } } });
    const actions = store.getActions();
    const expectedAction = actions.find(
      action =>
        action.type === INITIAL_FORM_DATA_REQUEST &&
        action.payload.pidValue === '999' &&
        action.payload.pidType === 'jobs'
    );
    expect(expectedAction).toBeDefined();
  });

  it('does not dispatches job update form data request action again when match props changed but recordId is same', () => {
    const initalMatchProps = {
      params: {
        id: '123',
      },
    };
    const store = getStore();
    const wrapper = shallow(
      <JobUpdateSubmissionPage match={initalMatchProps} store={store} />
    ).dive();
    wrapper.setProps({ match: { params: { id: '123' } } });
    const actions = store.getActions();
    const expectedActions = actions.filter(
      action =>
        action.type === INITIAL_FORM_DATA_REQUEST &&
        action.payload.pidValue === '123'
    );
    expect(expectedActions.length).toBe(1);
  });

  // FIXME: assert that dispatches submit request to update the job onSubmit
});
