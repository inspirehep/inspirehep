import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { Checkbox } from 'antd';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import PublicationSelectContainer from '../PublicationSelectContainer';
import { setPulicationSelection } from '../../../actions/authors';

jest.mock('../../../actions/authors');
mockActionCreator(setPulicationSelection);

describe('PublicationSelectContainer', () => {
  it('dispatches setPulicationSelection on change', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} />
      </Provider>
    );
    wrapper.find(Checkbox).prop('onChange')({ target: { checked: true } });
    const expectedActions = [setPulicationSelection([1], true)];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
