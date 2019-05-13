import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CitationSummaryTableContainer from '../CitationSummaryTableContainer';

describe('CitationSummaryTableContainer', () => {
  it('pass props from state', () => {
    const store = getStoreWithState({
      citations: fromJS({
        loadingCitationSummary: false,
        errorCitationSummary: null,
        citationSummary: {
          citations: {
            buckets: {
              all: { name: 'citeable' },
              published: { name: 'published' },
            },
          },
          'h-index': {
            value: { name: 'h-index' },
          },
        },
      }),
    });
    const wrapper = shallow(<CitationSummaryTableContainer store={store} />);
    expect(wrapper).toMatchSnapshot();
  });
});
