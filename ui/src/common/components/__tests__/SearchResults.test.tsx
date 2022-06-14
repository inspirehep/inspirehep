import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import SearchResults from '../SearchResults';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SearchResults', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        results={results}
        renderItem={(result) => <span>{result.get('value')}</span>}
        isCatalogerLoggedIn={false}
        page={2}
        pageSize={10}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with required props', () => {
    const wrapper = shallow(
      <SearchResults
        renderItem={(result) => <span>{result.get('value')}</span>}
        page={1}
        pageSize={15}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
