import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { Checkbox } from 'antd';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import PublicationSelectContainer from '../PublicationSelectContainer';
import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
} from '../../../actions/authors';

jest.mock('../../../actions/authors');
mockActionCreator(setPublicationSelection);
mockActionCreator(setPublicationsClaimedSelection);

describe('PublicationSelectContainer', () => {
  it('dispatches setPublicationSelection on change', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <PublicationSelectContainer recordId={1} claimed />
      </Provider>
    );
    wrapper.find(Checkbox).prop('onChange')({ target: { checked: true } });
    const expectedActions = [
      setPublicationsClaimedSelection([1], true),
      setPublicationSelection([1], true),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
