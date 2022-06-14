import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ImprintInfo from '../ImprintInfo';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ImprintInfo', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders imprints with date', () => {
    const imprint = fromJS([
      {
        date: '2004',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders imprints with place', () => {
    const imprint = fromJS([
      {
        place: 'Cambridge, UK',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders imprints with publisher', () => {
    const imprint = fromJS([
      {
        publisher: 'Univ. Pr.',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders imprints with date and publisher', () => {
    const imprint = fromJS([
      {
        date: '2004',
        publisher: 'Univ. Pr.',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders imprints with date and place', () => {
    const imprint = fromJS([
      {
        date: '2004',
        place: 'Cambridge, UK',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders imprints with publisher and place', () => {
    const imprint = fromJS([
      {
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders imprints with date, publisher, and place', () => {
    const imprint = fromJS([
      {
        date: '2004',
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders multiple imprints', () => {
    const imprint = fromJS([
      {
        date: '2004',
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
      {
        date: '2010',
        publisher: 'Univ. Pr.',
        place: 'Cambridge, UK',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders date with month and day', () => {
    const imprint = fromJS([
      {
        date: '2018-06-17',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ImprintInfo imprint={imprint} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
