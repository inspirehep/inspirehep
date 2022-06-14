import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { fromJS, Set } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import LiteratureSelectAllContainer from '../LiteratureSelectAllContainer';
import { setLiteratureSelection } from '../../../actions/literature';
import LiteratureSelectAll from '../../components/LiteratureSelectAll';
import { LITERATURE_NS } from '../../../search/constants';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/literature');
mockActionCreator(setLiteratureSelection);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LiteratureSelectAllContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes state to props', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);
    const selection = Set([1]);
    const store = getStore({
      literature: fromJS({
        literatureSelection: selection,
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            results: publications,
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <LiteratureSelectAllContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(LiteratureSelectAll)).toHaveProp({
      publications,
      selection,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches setSelectionMap on click', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <LiteratureSelectAllContainer />
      </Provider>
    );
    wrapper.find(LiteratureSelectAll).prop('onChange')([1, 2, 3], true);
    const expectedActions = [setLiteratureSelection([1, 2, 3], true)];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
