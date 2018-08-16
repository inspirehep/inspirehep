import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { getStore } from '../../../fixtures/store';
import { AUTHOR_UPDATE_FORM_DATA_REQUEST } from '../../../actions/actionTypes';
import AuthorUpdateSubmissionPage from '../AuthorUpdateSubmissionPage';

describe('AuthorUpdateSubmissionPage', () => {
  it('dispatches author update form data request action', () => {
    const store = getStore();
    const matchProps = {
      params: {
        id: '123',
      },
    };
    mount(
      <Provider store={store}>
        <AuthorUpdateSubmissionPage match={matchProps} />
      </Provider>
    );
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
    const wrapper = mount(
      <AuthorUpdateSubmissionPage match={initalMatchProps} store={store} />
    );
    wrapper.setProps({ match: { params: { id: '999' } } });
    const actions = store.getActions();
    const expectedAction = actions.find(
      action =>
        action.type === AUTHOR_UPDATE_FORM_DATA_REQUEST &&
        action.payload.recordId === '999'
    );
    expect(expectedAction).toBeDefined();
  });

  // FIXME: assert that dispatches submit request to update the author onSubmit
});
