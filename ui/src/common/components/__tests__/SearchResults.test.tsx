import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import SearchResults from '../SearchResults';


describe('SearchResults', () => {
  
  it('renders with all props set', () => {
    const results = fromJS([
      {
        id: 1,
        value: 'value1',
      },
      {
        id: 2,
        value: 'value2',
      },
    ]);
    const wrapper = shallow(
      <SearchResults
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        results={results}
        renderItem={(result: any) => <span>{result.get('value')}</span>}
        isCatalogerLoggedIn={false}
        page={2}
        pageSize={10}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with required props', () => {
    const wrapper = shallow(
      <SearchResults
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        renderItem={(result: any) => <span>{result.get('value')}</span>}
        page={1}
        pageSize={15}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
