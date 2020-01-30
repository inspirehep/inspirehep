import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { Formik } from 'formik';
import { fromJS } from 'immutable';

import { getStore, getStoreWithState } from '../../../fixtures/store';
import { USER_SIGN_UP_REQUEST } from '../../../actions/actionTypes';
import { initialState } from '../../../reducers/user';
import SignUpPageContainer from '../SignUpPageContainer';
import SignUpPage from '../../components/SignUpPage';

describe('SignUpPageContainer', () => {
  it('calls userSignUp onLoginClick', () => {
    const store = getStore(initialState);
    const wrapper = mount(
      <Provider store={store}>
        <SignUpPageContainer />
      </Provider>
    );
    const onFormikSubmit = wrapper.find(Formik).prop('onSubmit');
    onFormikSubmit();
    const expectedActions = [
      {
        type: USER_SIGN_UP_REQUEST,
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

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
    expect(wrapper.find(SignUpPage)).toHaveProp({
      error: {
        message: 'This is an error',
      },
      loading: true,
    });
  });
});
