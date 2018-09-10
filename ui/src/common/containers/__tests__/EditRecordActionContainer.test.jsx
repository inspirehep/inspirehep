import React from 'react';
import { fromJS } from 'immutable';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { getStoreWithState } from '../../../fixtures/store';
import EditRecordActionContainer from '../EditRecordActionContainer';

describe('EditRecordActionContainer', () => {
  it('renders edit button if user is superuser', () => {
    const store = getStoreWithState({
      user: fromJS({
        data: {
          roles: ['superuser'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <EditRecordActionContainer recordId={123456} />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders edit button if user is cataloger', () => {
    const store = getStoreWithState({
      user: fromJS({
        data: {
          roles: ['cataloger'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <EditRecordActionContainer recordId={123456} />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render edit button if user is not cataloger or superuser', () => {
    const store = getStoreWithState({
      user: fromJS({
        data: {
          roles: ['unauthorized'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <EditRecordActionContainer recordId={123456} />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
