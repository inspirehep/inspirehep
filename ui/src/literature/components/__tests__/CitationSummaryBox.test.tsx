import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import CitationSummaryBox from '../CitationSummaryBox';
import { LITERATURE_NS } from '../../../search/constants';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CitationSummaryBox', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    const wrapper = shallow(
      <CitationSummaryBox
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ query: any; onQueryChange: any; namespace:... Remove this comment to see the full error message
        query={fromJS({ q: 'cern' })}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onQueryChange={jest.fn()}
        namespace={LITERATURE_NS}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // TODO: enable after https://github.com/airbnb/enzyme/issues/2086
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'xit'.
  xit('calls onQueryChange initially and when query is different', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onQueryChange = jest.fn();
    const initialQuery = fromJS({ q: 'cern' });
    const wrapper = shallow(
      <CitationSummaryBox
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ query: any; onQueryChange: any; namespace:... Remove this comment to see the full error message
        query={initialQuery}
        onQueryChange={onQueryChange}
        namespace={LITERATURE_NS}
      />
    );
    const newQuery = fromJS({ experiment: 'cms' });

    wrapper.setProps({ query: newQuery });

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onQueryChange).toHaveBeenCalledWith(initialQuery);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onQueryChange).toHaveBeenCalledWith(newQuery);
  });

  // TODO: enable after https://github.com/airbnb/enzyme/issues/2086
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'xit'.
  xit('calls onQueryChange initially and when checkbox state changes', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onQueryChange = jest.fn();
    const query = fromJS({ q: 'cern' });
    const initialExcludeSC = false;
    const wrapper = shallow(
      <CitationSummaryBox
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ query: any; onQueryChange: any; namespace:... Remove this comment to see the full error message
        query={query}
        onQueryChange={onQueryChange}
        namespace={LITERATURE_NS}
        excludeSelfCitations={initialExcludeSC}
      />
    );
    const newExcludeSC = true;

    wrapper.setProps({ excludeSelfCitations: newExcludeSC });

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onQueryChange).toHaveBeenCalledWith(query, initialExcludeSC);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onQueryChange).toHaveBeenCalledWith(query, newExcludeSC);
  });
});
