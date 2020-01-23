import React from 'react';
import { shallow } from 'enzyme';

import CitationSummaryBox from '../CitationSummaryBox';

describe('CitationSummaryBox', () => {
  it('renders', () => {
    const wrapper = shallow(
      <CitationSummaryBox query={{ q: 'cern' }} onQueryChange={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  // TODO: enable after https://github.com/airbnb/enzyme/issues/2086
  xit('calls onQueryChange initially and when query is different', () => {
    const onQueryChange = jest.fn();
    const initialQuery = { q: 'cern' };
    const wrapper = shallow(
      <CitationSummaryBox query={initialQuery} onQueryChange={onQueryChange} />
    );
    const newQuery = { experiment: 'cms' };

    wrapper.setProps({ query: newQuery });

    expect(onQueryChange).toHaveBeenCalledWith(initialQuery);
    expect(onQueryChange).toHaveBeenCalledWith(newQuery);
  });
});
