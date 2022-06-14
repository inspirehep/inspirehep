import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ThesisInfo from '../ThesisInfo';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ThesisInfo', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders full thesis info', () => {
    const thesisInfo = fromJS({
      degreeType: 'phd',
      date: '11-11-2011',
      defense_date: '12-12-2012',
      institutions: [
        {
          name: 'Institution 1',
        },
      ],
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ThesisInfo thesisInfo={thesisInfo} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with defense date', () => {
    const thesisInfo = fromJS({
      date: '11-11-2011',
      defense_date: '12-12-2012',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ThesisInfo thesisInfo={thesisInfo} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with date and without defense date', () => {
    const thesisInfo = fromJS({
      date: '11-11-2011',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ThesisInfo thesisInfo={thesisInfo} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders without any date', () => {
    const thesisInfo = fromJS({
      institutions: [
        {
          name: 'Institution 1',
        },
      ],
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ThesisInfo thesisInfo={thesisInfo} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders empty if null', () => {
    const wrapper = shallow(<ThesisInfo />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
