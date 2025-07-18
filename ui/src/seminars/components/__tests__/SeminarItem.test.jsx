import React from 'react';
import { fromJS } from 'immutable';

import SeminarItem from '../SeminarItem';
import * as constants from '../../../common/constants';
import { renderWithProviders } from '../../../fixtures/render';

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

    const { getByText } = renderWithProviders(
      <SeminarItem metadata={metadata} />
    );
    expect(getByText('John, Doe')).toBeInTheDocument();
    expect(
      getByText('15 May 2020, 01:45 PM - 17 May 2020, 02:45 AM')
    ).toBeInTheDocument();
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

    const { getByText } = renderWithProviders(
      <SeminarItem metadata={metadata} />
    );
    expect(getByText('John, Doe')).toBeInTheDocument();
    expect(
      getByText('15 May 2020, 01:45 PM - 17 May 2020, 02:45 AM')
    ).toBeInTheDocument();
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

    const { getByText } = renderWithProviders(
      <SeminarItem metadata={metadata} selectedTimezone="America/Chicago" />
    );
    expect(getByText('John, Doe')).toBeInTheDocument();
    expect(getByText(/15 May 2020, 06:45 AM/i)).toBeInTheDocument();
    expect(getByText(/15 May 2020, 01:45 PM/i)).toBeInTheDocument();
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

    const { getByText } = renderWithProviders(
      <SeminarItem metadata={metadata} selectedTimezone="Europe/Zurich" />
    );
    expect(getByText('John, Doe')).toBeInTheDocument();
    expect(
      getByText('15 May 2020, 01:45 PM - 17 May 2020, 02:45 AM')
    ).toBeInTheDocument();
  });
});
