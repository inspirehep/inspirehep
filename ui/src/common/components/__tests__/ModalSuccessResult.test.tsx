import React from 'react';
import { shallow } from 'enzyme';

import ModalSuccessResult from '../ModalSuccessResult';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ModalSuccessResult', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with children', () => {
    const wrapper = shallow(
      <ModalSuccessResult>
        <span>Successfully did the thing</span>
      </ModalSuccessResult>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
