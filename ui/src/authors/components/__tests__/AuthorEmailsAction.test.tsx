import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorEmailsAction from '../AuthorEmailsAction';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AuthorEmailsAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders multiple current emails in a dropdown', () => {
    const emails = fromJS([
      { value: 'dude@email.cern' },
      { value: 'other-dude@email.cern' },
    ]);
    const wrapper = shallow(<AuthorEmailsAction emails={emails} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders single email', () => {
    const emails = fromJS([{ value: 'dude@email.cern' }]);
    const wrapper = shallow(<AuthorEmailsAction emails={emails} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
