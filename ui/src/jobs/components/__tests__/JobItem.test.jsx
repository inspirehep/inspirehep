import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobItem from '../JobItem';

describe('JobItem', () => {
  it('renders full job search result item', () => {
    const created = '2019-05-31T12:23:15.104851+00:00';
    const metadata = fromJS({
      deadline_date: '2020-05-31',
      position: 'Job Offer',
      arxiv_categories: ['hep-ex'],
      control_number: 12345,
      accelerator_experiments: [{ name: 'CERN-LHC-ATLAS' }],
      ranks: ['SENIOR'],
      regions: ['Europe'],
      institutions: [
        {
          value: 'CERN',
        },
      ],
    });
    const { getByText } = render(
      <MemoryRouter>
        <JobItem metadata={metadata} created={created} />
      </MemoryRouter>
    );
    expect(getByText('Job Offer')).toBeInTheDocument();
    expect(getByText('Deadline on May 31, 2020')).toBeInTheDocument();
    expect(getByText('CERN')).toBeInTheDocument();
    expect(getByText('CERN-LHC-ATLAS')).toBeInTheDocument();
    expect(getByText('hep-ex')).toBeInTheDocument();
    expect(getByText('Europe')).toBeInTheDocument();
    expect(getByText('Senior (permanent)')).toBeInTheDocument();
    expect(getByText('6 years ago')).toBeInTheDocument();
  });
});
