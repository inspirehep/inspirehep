import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import CitationSummaryBox from '../CitationSummaryBox';
import { LITERATURE_NS } from '../../../search/constants';

<<<<<<< Updated upstream

describe('CitationSummaryBox', () => {
  
=======
describe('CitationSummaryBox', () => {
>>>>>>> Stashed changes
  it('renders', () => {
    const wrapper = shallow(
      <CitationSummaryBox
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ query: any; onQueryChange: any; namespace:... Remove this comment to see the full error message
        query={fromJS({ q: 'cern' })}
<<<<<<< Updated upstream
        
=======
>>>>>>> Stashed changes
        onQueryChange={jest.fn()}
        namespace={LITERATURE_NS}
      />
    );
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });

  // TODO: enable after https://github.com/airbnb/enzyme/issues/2086
  xit('calls onQueryChange initially and when query is different', () => {
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    
    expect(onQueryChange).toHaveBeenCalledWith(initialQuery);
    
=======
    expect(onQueryChange).toHaveBeenCalledWith(initialQuery);
>>>>>>> Stashed changes
    expect(onQueryChange).toHaveBeenCalledWith(newQuery);
  });

  // TODO: enable after https://github.com/airbnb/enzyme/issues/2086
  xit('calls onQueryChange initially and when checkbox state changes', () => {
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    
    expect(onQueryChange).toHaveBeenCalledWith(query, initialExcludeSC);
    
=======
    expect(onQueryChange).toHaveBeenCalledWith(query, initialExcludeSC);
>>>>>>> Stashed changes
    expect(onQueryChange).toHaveBeenCalledWith(query, newExcludeSC);
  });
});
