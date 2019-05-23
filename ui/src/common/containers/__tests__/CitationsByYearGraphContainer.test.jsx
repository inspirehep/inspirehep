import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CitationsByYearGraphContainer from '../CitationsByYearGraphContainer';

describe('CitationsByYearGraphContainer', () => {
  it('pass props from state', () => {
    const store = getStoreWithState({
      citations: fromJS({
        loadingCitationsByYear: false,
        errorCitationsByYear: null,
        byYear: {
          '1999': 134,
          '2002': 125,
        },
      }),
    });
    const wrapper = shallow(
      <CitationsByYearGraphContainer store={store} />
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
