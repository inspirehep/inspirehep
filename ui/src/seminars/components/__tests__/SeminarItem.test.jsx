import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import SeminarItem from '../SeminarItem';
import * as constants from '../../../common/constants';

describe('SeminarItem', () => {
  constants.LOCAL_TIMEZONE = 'Europe/Zurich';

  it('renders with all props set', () => {
    const metadata = fromJS({
      title: { title: 'test' },
      control_number: 12345,
      can_edit: true,
      urls: [{ value: 'http://url.com' }],
      join_urls: [{ value: 'http://urljoin.com', description: 'zoom' }],
      speakers: [{ name: 'John, Doe', affiliations: [{ value: 'CERN' }] }],
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
      material_urls: [
        { value: 'http://urlmaterial.com', description: 'slides' },
      ],
    });

    const wrapper = shallow(<SeminarItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only needed props', () => {
    const metadata = fromJS({
      title: { title: 'test' },
      control_number: 12345,
      can_edit: true,
      speakers: [{ name: 'John, Doe', affiliations: [{ value: 'CERN' }] }],
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
    });

    const wrapper = shallow(<SeminarItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with selected timezone with a different time than local timezone', () => {
    const metadata = fromJS({
      title: { title: 'test' },
      control_number: 12345,
      can_edit: true,
      speakers: [{ name: 'John, Doe', affiliations: [{ value: 'CERN' }] }],
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
    });

    const wrapper = shallow(
      <SeminarItem metadata={metadata} selectedTimezone="America/Chicago" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with selected timezone with a same time as local timezone', () => {
    const metadata = fromJS({
      title: { title: 'test' },
      control_number: 12345,
      can_edit: true,
      speakers: [{ name: 'John, Doe', affiliations: [{ value: 'CERN' }] }],
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
    });

    const wrapper = shallow(
      <SeminarItem metadata={metadata} selectedTimezone="Europe/Zurich" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
