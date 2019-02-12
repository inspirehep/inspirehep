import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';
import { getStoreWithState } from '../../../fixtures/store';
import { EXCEPTIONS_REQUEST } from '../../../actions/actionTypes';
import ExceptionsPage from '../ExceptionsPage';

describe('ExceptionsPage', () => {
  it('renders initial state', () => {
    const store = getStoreWithState({
      exceptions: fromJS({
        data: [
          {
            collection: 'hep',
            error: 'Some error',
            recid: 123456,
          },
        ],
        loading: false,
      }),
    });

    const wrapper = shallow(<ExceptionsPage store={store} />)
      .dive()
      .dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders initial state when loading is true', () => {
    const store = getStoreWithState({
      exceptions: fromJS({
        data: [],
        loading: true,
      }),
    });

    const wrapper = shallow(<ExceptionsPage store={store} />)
      .dive()
      .dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('dispatches exceptions', () => {
    const store = getStoreWithState({
      exceptions: fromJS({
        data: [
          {
            collection: 'hep',
            error: 'Some error',
            recid: 123456,
          },
        ],
        loading: false,
      }),
    });
    mount(<ExceptionsPage store={store} />);
    const actions = store.getActions();
    expect(actions.some(action => action.type === EXCEPTIONS_REQUEST)).toBe(
      true
    );
  });
});
