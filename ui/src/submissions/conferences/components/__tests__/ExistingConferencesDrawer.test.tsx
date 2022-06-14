import React from 'react';
import { shallow } from 'enzyme';

import ExistingConferencesDrawer from '../ExistingConferencesDrawer';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExistingConferencesDrawer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders drawer with number of conferences', () => {
    const visible = true;
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onDrawerClose = jest.fn();
    const numberOfConferences = 5;

    const wrapper = shallow(
      <ExistingConferencesDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        numberOfConferences={numberOfConferences}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
