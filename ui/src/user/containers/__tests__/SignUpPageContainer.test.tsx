import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { Formik } from 'formik';
import { fromJS } from 'immutable';

import { getStore, getStoreWithState } from '../../../fixtures/store';
import { USER_SIGN_UP_REQUEST } from '../../../actions/actionTypes';
import { initialState } from '../../../reducers/user';
import SignUpPageContainer from '../SignUpPageContainer';
import SignUpPage from '../../components/SignUpPage';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SignUpPageContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls userSignUp onLoginClick', () => {
    const store = getStore(initialState);
    const wrapper = mount(
      <Provider store={store}>
        <SignUpPageContainer />
      </Provider>
    );
    const onFormikSubmit = wrapper.find(Formik).prop('onSubmit');
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    onFormikSubmit();
    const expectedActions = [
      {
        type: USER_SIGN_UP_REQUEST,
      },
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes errors, onSubmit, and loading from the state', () => {
    const store = getStoreWithState({
      user: fromJS({
        isSigningUp: true,
        signUpError: {
          message: 'This is an error',
        },
      }),
    });

    const wrapper = mount(
      <Provider store={store}>
        <SignUpPageContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(SignUpPage)).toHaveProp({
      error: {
        message: 'This is an error',
      },
      loading: true,
    });
  });
});
