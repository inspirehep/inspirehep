import React from 'react';
import { shallow } from 'enzyme';

import NumberOfResultsWithSelectedItemsNumber from '../NumberOfResultsWithSelectedItemsNumber';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('NumberOfResultsWithSelectedItemsNumber', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders selected when selected is more than 1', () => {
    const wrapper = shallow(
      <NumberOfResultsWithSelectedItemsNumber
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; numberOfSelected:... Remove this comment to see the full error message
        numberOfResults={27276}
        numberOfSelected={25}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders selected when selected is 1', () => {
    const wrapper = shallow(
      <NumberOfResultsWithSelectedItemsNumber
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; numberOfSelected:... Remove this comment to see the full error message
        numberOfResults={27276}
        numberOfSelected={1}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render selected when selected is 0', () => {
    const wrapper = shallow(
      <NumberOfResultsWithSelectedItemsNumber
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ numberOfResults: number; numberOfSelected:... Remove this comment to see the full error message
        numberOfResults={27276}
        numberOfSelected={0}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
