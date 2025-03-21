import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { MemoryRouter } from 'react-router-dom';
import RelatedRecordsList from '../RelatedRecordsList';
import { INSTITUTIONS_PID_TYPE, EXPERIMENTS_PID_TYPE } from '../../constants';

describe('RelatedRecordsList', () => {
  it('renders with multiple records', () => {
    const relatedRecords = fromJS([
      {
        control_number: 123,
        legacy_ICN: 'Inst 1',
      },
      {
        control_number: 124,
        legacy_ICN: 'Inst 3',
      },
    ]);
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <RelatedRecordsList
          relatedRecords={relatedRecords}
          relationType="Subsidiary"
          label="Institution"
          pidType={INSTITUTIONS_PID_TYPE}
        />
      </MemoryRouter>
    );
    expect(getByText(/Subsidiary Institutions/i)).toBeInTheDocument();
    expect(getByRole('link', { name: 'Inst 1' })).toHaveAttribute(
      'href',
      '/institutions/123'
    );
    expect(getByRole('link', { name: 'Inst 3' })).toHaveAttribute(
      'href',
      '/institutions/124'
    );
  });
  it('renders with one record', () => {
    const relatedRecords = fromJS([
      {
        control_number: 123,
        legacy_ICN: 'Inst 1',
      },
    ]);
    const { getByText, getByRole } = render(
      <MemoryRouter>
        <RelatedRecordsList
          relatedRecords={relatedRecords}
          relationType="Subsidiary"
          label="Experiment"
          pidType={EXPERIMENTS_PID_TYPE}
        />
      </MemoryRouter>
    );
    expect(getByText(/Subsidiary Experiment/i)).toBeInTheDocument();
    expect(getByRole('link', { name: 'Inst 1' })).toHaveAttribute(
      'href',
      '/experiments/123'
    );
  });
});
