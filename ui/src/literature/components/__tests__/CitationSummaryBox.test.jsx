import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import CitationSummaryBox from '../CitationSummaryBox';
import { LITERATURE_NS } from '../../../search/constants';

describe('CitationSummaryBox', () => {
  it('renders', () => {
    const wrapper = shallow(
      <CitationSummaryBox
        query={fromJS({ q: 'cern' })}
        onQueryChange={jest.fn()}
        namespace={LITERATURE_NS}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  // TODO: enable after https://github.com/airbnb/enzyme/issues/2086
  xit('calls onQueryChange initially and when query is different', () => {
    const onQueryChange = jest.fn();
    const initialQuery = fromJS({ q: 'cern' });
    const wrapper = shallow(
      <CitationSummaryBox
        query={initialQuery}
        onQueryChange={onQueryChange}
        namespace={LITERATURE_NS}
      />
    );
    const newQuery = fromJS({ experiment: 'cms' });

    wrapper.setProps({ query: newQuery });

    expect(onQueryChange).toHaveBeenCalledWith(initialQuery);
    expect(onQueryChange).toHaveBeenCalledWith(newQuery);
  });

  // TODO: enable after https://github.com/airbnb/enzyme/issues/2086
  xit('calls onQueryChange initially and when checkbox state changes', () => {
    const onQueryChange = jest.fn();
    const query = fromJS({ q: 'cern' });
    const initialExcludeSC = false;
    const wrapper = shallow(
      <CitationSummaryBox
        query={query}
        onQueryChange={onQueryChange}
        namespace={LITERATURE_NS}
        excludeSelfCitations={initialExcludeSC}
      />
    );
    const newExcludeSC = true;

    wrapper.setProps({ excludeSelfCitations: newExcludeSC });

    expect(onQueryChange).toHaveBeenCalledWith(query, initialExcludeSC);
    expect(onQueryChange).toHaveBeenCalledWith(query, newExcludeSC);
  });
});
