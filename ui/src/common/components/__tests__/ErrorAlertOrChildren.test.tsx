import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ErrorAlertOrChildren from '../ErrorAlertOrChildren';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ErrorAlertOrChildren', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders error if present', () => {
    const wrapper = shallow(
      <ErrorAlertOrChildren error={fromJS({ message: 'Error' })}>
        Nope
      </ErrorAlertOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children without eror', () => {
    const wrapper = shallow(
      <ErrorAlertOrChildren error={null}>
        <div>Test</div>
      </ErrorAlertOrChildren>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
