import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import CitationSummaryBox from '../CitationSummaryBox';

describe('CitationSummaryBox', () => {
  it('renders', () => {
    const wrapper = shallow(
      <CitationSummaryBox
        query={fromJS({ q: 'cern' })}
        onQueryChange={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  // TODO: enable after https://github.com/airbnb/enzyme/issues/2086
  xit('calls onQueryChange initially and when query is different', () => {
    const onQueryChange = jest.fn();
    const initialQuery = fromJS({ q: 'cern' });
    const wrapper = shallow(
      <CitationSummaryBox query={initialQuery} onQueryChange={onQueryChange} />
    );
    const newQuery = fromJS({ experiment: 'cms' });

    wrapper.setProps({ query: newQuery });

    expect(onQueryChange).toHaveBeenCalledWith(initialQuery);
    expect(onQueryChange).toHaveBeenCalledWith(newQuery);
  });
});
