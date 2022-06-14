import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ProceedingsAction from '../ProceedingsAction';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ProceedingsAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders proceedings', () => {
    const proceedings = fromJS([
      { control_number: '12345' },
      {
        control_number: '54321',
        publication_info: [{ journal_title: 'Journal 1' }],
      },
    ]);
    const wrapper = shallow(<ProceedingsAction proceedings={proceedings} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders single item', () => {
    const proceedings = fromJS([{ control_number: '12345' }]);
    const wrapper = shallow(<ProceedingsAction proceedings={proceedings} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
