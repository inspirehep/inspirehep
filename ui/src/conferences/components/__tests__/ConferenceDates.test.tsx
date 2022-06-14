import React from 'react';
import { shallow } from 'enzyme';

import ConferenceDates from '../ConferenceDates';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ConferenceDates', () => {

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders only opening date ', () => {
    const opening = '2019-05-12'
    // @ts-expect-error ts-migrate(2786) FIXME: 'ConferenceDates' cannot be used as a JSX componen... Remove this comment to see the full error message
    const wrapper = shallow(<ConferenceDates openingDate={opening} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders only opening date with missing day', () => {
    const opening = '2019-05'
    // @ts-expect-error ts-migrate(2786) FIXME: 'ConferenceDates' cannot be used as a JSX componen... Remove this comment to see the full error message
    const wrapper = shallow(<ConferenceDates openingDate={opening} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders only of the dates if opening and closing are same', () => {
    const opening = '2019-05-02';
    const closing = '2019-05-02';
    // @ts-expect-error ts-migrate(2786) FIXME: 'ConferenceDates' cannot be used as a JSX componen... Remove this comment to see the full error message
    const wrapper = shallow(<ConferenceDates openingDate={opening} closingDate={closing} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when opening and closing on different dates of the same month', () => {
    const opening = '2019-05-02';
    const closing = '2019-05-05';
    // @ts-expect-error ts-migrate(2786) FIXME: 'ConferenceDates' cannot be used as a JSX componen... Remove this comment to see the full error message
    const wrapper = shallow(<ConferenceDates openingDate={opening} closingDate={closing} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });


  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when opening and closing in different months of the same year', () => {
    const opening = '2019-04-29';
    const closing = '2019-05-05';
    // @ts-expect-error ts-migrate(2786) FIXME: 'ConferenceDates' cannot be used as a JSX componen... Remove this comment to see the full error message
    const wrapper = shallow(<ConferenceDates openingDate={opening} closingDate={closing} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when opening and closing in different months of the same year and day is missing', () => {
    const opening = '2019-04';
    const closing = '2019-07';
    // @ts-expect-error ts-migrate(2786) FIXME: 'ConferenceDates' cannot be used as a JSX componen... Remove this comment to see the full error message
    const wrapper = shallow(<ConferenceDates openingDate={opening} closingDate={closing} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when opening and closing has only (same) year', () => {
    const opening = '2019';
    const closing = '2019';
    // @ts-expect-error ts-migrate(2786) FIXME: 'ConferenceDates' cannot be used as a JSX componen... Remove this comment to see the full error message
    const wrapper = shallow(<ConferenceDates openingDate={opening} closingDate={closing} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when opening and closing is completely different', () => {
    const opening = '2019-12-30';
    const closing = '2020-01-05';
    // @ts-expect-error ts-migrate(2786) FIXME: 'ConferenceDates' cannot be used as a JSX componen... Remove this comment to see the full error message
    const wrapper = shallow(<ConferenceDates openingDate={opening} closingDate={closing} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
