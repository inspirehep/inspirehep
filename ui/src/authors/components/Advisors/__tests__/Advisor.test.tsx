import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Advisor from '../Advisor';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Advisor', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders linked', () => {
    const advisor = fromJS({
      name: 'Yoda',
      record: {
        $ref: 'https://inspirehep.net/api/authors/12345',
      },
    });
    const wrapper = shallow(<Advisor advisor={advisor} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with first_name and last_name', () => {
    const advisor = fromJS({
      name: 'Yoda, John',
      first_name: 'John',
      last_name: 'Yoda',
      record: {
        $ref: 'https://inspirehep.net/api/authors/12345',
      },
    });
    const wrapper = shallow(<Advisor advisor={advisor} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only first_name', () => {
    const advisor = fromJS({
      name: 'Yoda, John',
      first_name: 'John',
      record: {
        $ref: 'https://inspirehep.net/api/authors/12345',
      },
    });
    const wrapper = shallow(<Advisor advisor={advisor} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders unliked', () => {
    const advisor = fromJS({
      name: 'Yoda',
    });
    const wrapper = shallow(<Advisor advisor={advisor} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
