import { getAllByRole, render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { MemoryRouter } from 'react-router-dom';

import ExperimentList from '../ExperimentList';

describe('ExperimentList', () => {
  it('renders arxiv categories', () => {
    const experiments = fromJS([
      {
        name: 'CERN-LHC-CMS',
        record: { $ref: 'http://labs.inspirehep.net/api/experiments/1110623' },
      },
      { name: 'CERN-LHC-LHCb' },
    ]);
    const { container, getByRole } = render(
      <MemoryRouter>
        <ExperimentList experiments={experiments} />
      </MemoryRouter>
    );
    expect(getByRole('link', { name: 'CERN-LHC-CMS' })).toHaveAttribute(
      'href',
      '/experiments/1110623'
    );
    expect(getAllByRole(container, 'listitem')[1]).toHaveTextContent(
      'CERN-LHC-LHCb'
    );
  });
});
