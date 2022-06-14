import React from 'react';
import { shallow } from 'enzyme';

import ExistingConferencesAlert from '../ExistingConferencesAlert';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExistingConferencesAlert', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders alert and drawer', () => {
    const dates = ['2020-01-24', '2020-09-20'];
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onDatesChange = jest.fn();
    const numberOfConferences = 5;

    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2786) FIXME: 'ExistingConferencesAlert' cannot be used as a JSX... Remove this comment to see the full error message
      <ExistingConferencesAlert
        dates={dates}
        onDatesChange={onDatesChange}
        numberOfConferences={numberOfConferences}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
