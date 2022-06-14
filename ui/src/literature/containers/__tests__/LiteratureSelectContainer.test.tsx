import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { Checkbox } from 'antd';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import LiteratureSelectContainer from '../LiteratureSelectContainer';
import { setLiteratureSelection } from '../../../actions/literature';

jest.mock('../../../actions/literature');
mockActionCreator(setLiteratureSelection);

describe('LiteratureSelectContainer', () => {
  it('dispatches setLiteratureSelection on change', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <LiteratureSelectContainer recordId={1} />
      </Provider>
    );
    wrapper.find(Checkbox).prop('onChange')({ target: { checked: true } });
    const expectedActions = [setLiteratureSelection([1], true)];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
