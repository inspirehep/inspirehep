import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { MemoryRouter } from 'react-router-dom';

import LiteratureRecordsList from '../LiteratureRecordsList';

describe('LiteratureRecordsList', () => {
  it('renders with multiple records', () => {
    const literatureRecords = fromJS([
      {
        control_number: 123,
        titles: [{ title: 'Title1' }],
        record: { $ref: 'http://localhost:5000/api/literature/123' },
      },
      {
        control_number: 124,
        titles: [{ title: 'Title2' }],
        record: { $ref: 'http://localhost:5000/api/literature/124' },
      },
    ]);
    const { getByRole } = render(
      <MemoryRouter>
        <LiteratureRecordsList literatureRecords={literatureRecords} />
      </MemoryRouter>
    );
    expect(getByRole('link', { name: 'Title1' })).toHaveAttribute(
      'href',
      '/literature/123'
    );
    expect(getByRole('link', { name: 'Title2' })).toHaveAttribute(
      'href',
      '/literature/124'
    );
  });
  it('renders with one record', () => {
    const literatureRecords = fromJS([
      {
        control_number: 123,
        titles: [{ title: 'Title1' }],
        record: { $ref: 'http://localhost:5000/api/literature/123' },
      },
    ]);
    const { getByRole } = render(
      <MemoryRouter>
        <LiteratureRecordsList literatureRecords={literatureRecords} />
      </MemoryRouter>
    );
    expect(getByRole('link', { name: 'Title1' })).toHaveAttribute(
      'href',
      '/literature/123'
    );
  });
});
