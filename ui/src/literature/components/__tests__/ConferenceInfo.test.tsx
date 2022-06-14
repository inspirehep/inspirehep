import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ConferenceInfo from '../ConferenceInfo';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ConferenceInfo', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders without acronyms present', () => {
    const info = fromJS({
      control_number: 1639582,
      titles: [
        {
          title:
            '15th Marcel Grossmann Meeting on Recent Developments in Theoretical and Experimental General Relativity, Astrophysics, and Relativistic Field Theories',
        },
      ],
    });
    const wrapper = shallow(<ConferenceInfo conferenceInfo={info} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with acronyms', () => {
    const info = fromJS({
      acronyms: ['MG15', 'SAP16'],
      control_number: 1639582,
      titles: [
        {
          title:
            '15th Marcel Grossmann Meeting on Recent Developments in Theoretical and Experimental General Relativity, Astrophysics, and Relativistic Field Theories',
        },
      ],
    });
    const wrapper = shallow(<ConferenceInfo conferenceInfo={info} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with acronyms and start and end page', () => {
    const info = fromJS({
      acronyms: ['MG15'],
      control_number: 1639582,
      titles: [
        {
          title:
            '15th Marcel Grossmann Meeting on Recent Developments in Theoretical and Experimental General Relativity, Astrophysics, and Relativistic Field Theories',
        },
      ],
      page_start: 1,
      page_end: 20,
    });
    const wrapper = shallow(<ConferenceInfo conferenceInfo={info} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only page start', () => {
    const info = fromJS({
      acronyms: ['MG15'],
      control_number: 1639582,
      titles: [
        {
          title:
            '15th Marcel Grossmann Meeting on Recent Developments in Theoretical and Experimental General Relativity, Astrophysics, and Relativistic Field Theories',
        },
      ],
      page_start: 1,
    });
    const wrapper = shallow(<ConferenceInfo conferenceInfo={info} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only page end', () => {
    const info = fromJS({
      acronyms: ['MG15'],
      control_number: 1639582,
      titles: [
        {
          title:
            '15th Marcel Grossmann Meeting on Recent Developments in Theoretical and Experimental General Relativity, Astrophysics, and Relativistic Field Theories',
        },
      ],
      page_end: 20,
    });
    const wrapper = shallow(<ConferenceInfo conferenceInfo={info} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
