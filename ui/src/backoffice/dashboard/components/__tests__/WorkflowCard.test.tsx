import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { List, Map } from 'immutable';

import { renderWithRouter } from '../../../../fixtures/render';
import { WorkflowStatuses, WorkflowTypes } from '../../../constants';
import {
  BACKOFFICE_AUTHORS_SEARCH,
  BACKOFFICE_LITERATURE_SEARCH,
} from '../../../../common/routes';
import WorkflowCard from '../WorkflowCard';

describe('<WorkflowCard />', () => {
  it('renders literature workflow card with links', () => {
    const type = Map({
      key: WorkflowTypes.HEP_CREATE,
      doc_count: 5,
    });
    const statuses = List([Map({ key: WorkflowStatuses.ERROR, doc_count: 2 })]);

    renderWithRouter(<WorkflowCard type={type} statuses={statuses} />);

    expect(screen.getByText('new arxiv harvests')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    const viewAll = screen.getByRole('link', { name: /view all/i });
    expect(viewAll).toHaveAttribute(
      'href',
      `${BACKOFFICE_LITERATURE_SEARCH}?workflow_type=${WorkflowTypes.HEP_CREATE}`
    );

    const statusLink = screen.getByText('error').closest('a');
    expect(statusLink).toHaveAttribute(
      'href',
      `${BACKOFFICE_LITERATURE_SEARCH}?workflow_type=${WorkflowTypes.HEP_CREATE}&status=${WorkflowStatuses.ERROR}`
    );
  });

  it('uses authors search route for author workflows', () => {
    const type = Map({
      key: WorkflowTypes.AUTHOR_CREATE,
      doc_count: 3,
    });
    const statuses = List([
      Map({ key: WorkflowStatuses.APPROVAL, doc_count: 1 }),
    ]);

    renderWithRouter(<WorkflowCard type={type} statuses={statuses} />);

    const viewAll = screen.getByRole('link', { name: /view all/i });
    expect(viewAll).toHaveAttribute(
      'href',
      `${BACKOFFICE_AUTHORS_SEARCH}?workflow_type=${WorkflowTypes.AUTHOR_CREATE}`
    );
  });
});
