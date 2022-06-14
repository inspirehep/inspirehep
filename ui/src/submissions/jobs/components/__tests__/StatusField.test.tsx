import React from 'react';
import { shallow } from 'enzyme';

import StatusField from '../StatusField';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('StatusField', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders if can modify but not cataloger logged in', () => {
    const wrapper = shallow(
      <StatusField canModify isCatalogerLoggedIn={false} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders if can modify and cataloger logged in', () => {
    const wrapper = shallow(<StatusField canModify isCatalogerLoggedIn />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders if can not modify and not cataloger logged in', () => {
    const wrapper = shallow(
      <StatusField canModify={false} isCatalogerLoggedIn={false} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
