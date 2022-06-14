import React from 'react';
import { shallow } from 'enzyme';
import ExperimentAssociatedArticlesLink from '../ExperimentAssociatedArticlesLink';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExperimentAssociatedArticlesLink', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    const wrapper = shallow(
      <ExperimentAssociatedArticlesLink
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'number'.
        recordId="12345"
        legacyName="Experiment"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
