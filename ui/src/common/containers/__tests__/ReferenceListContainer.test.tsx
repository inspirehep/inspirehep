import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import { fetchLiteratureReferences } from '../../../actions/literature';
import ReferenceList from '../../../literature/components/ReferenceList';
import ReferenceListContainer from '../ReferenceListContainer';
import { LITERATURE_REFERENCES_NS } from '../../../search/constants';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/literature');
// @ts-expect-error ts-migrate(2339) FIXME: Property 'mockReturnValue' does not exist on type ... Remove this comment to see the full error message
fetchLiteratureReferences.mockReturnValue(async () => {});

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ReferenceListContainer', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockClear' does not exist on type '(reco... Remove this comment to see the full error message
    fetchLiteratureReferences.mockClear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes required props from state', () => {
    const store = getStoreWithState({
      literature: fromJS({
        references: [{ control_number: 1 }, { control_number: 2 }],
        loadingReferences: true,
        totalReferences: 50,
        errorReferences: { message: 'Error' },
        pageReferences: 2,
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_REFERENCES_NS]: {
            query: { size: 10 },
            baseQuery: { size: 25, page: 1 },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <ReferenceListContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(ReferenceList)).toHaveProp({
      query: { size: 10, page: 2 },
      references: fromJS([{ control_number: 1 }, { control_number: 2 }]),
      loading: true,
      total: 50,
      error: fromJS({ message: 'Error' }),
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls fetchLiteratureReferences onQueryChange', () => {
    const store = getStoreWithState({
      literature: fromJS({
        references: [{ control_number: 1 }, { control_number: 2 }],
        loadingReferences: true,
        totalReferences: 50,
        errorReferences: { message: 'Error' },
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_REFERENCES_NS]: {
            query: { size: 10, page: 2, q: 'dude', sort: 'mostrecent' },
            baseQuery: { size: 25, page: 1 },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <ReferenceListContainer recordId={1} />
      </Provider>
    );
    const onQueryChange = wrapper.find(ReferenceList).prop('onQueryChange');
    const query = { page: 3 };
    onQueryChange(query);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(fetchLiteratureReferences).toHaveBeenCalledWith(1, query);
  });
});
