import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { Checkbox } from 'antd';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import LiteratureSelectContainer from '../LiteratureSelectContainer';
import { setLiteratureSelection } from '../../../actions/literature';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/literature');
mockActionCreator(setLiteratureSelection);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LiteratureSelectContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches setLiteratureSelection on change', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <LiteratureSelectContainer recordId={1} />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    wrapper.find(Checkbox).prop('onChange')({ target: { checked: true } });
    const expectedActions = [setLiteratureSelection([1], true)];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
