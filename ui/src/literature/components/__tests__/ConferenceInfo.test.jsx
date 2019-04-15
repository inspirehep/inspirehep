import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ConferenceInfo from '../ConferenceInfo';

describe('ConferenceInfo', () => {
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
    expect(wrapper).toMatchSnapshot();
  });

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
    expect(wrapper).toMatchSnapshot();
  });

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
    expect(wrapper).toMatchSnapshot();
  });

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
    expect(wrapper).toMatchSnapshot();
  });

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
    expect(wrapper).toMatchSnapshot();
  });
});
