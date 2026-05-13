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

const renderWorkflowCard = (
  type: Map<string, any>,
  statuses: List<Map<string, any>>,
  collapseMap: Map<string, boolean> = Map()
) => {
  renderWithRouter(
    <WorkflowCard
      type={type}
      statuses={statuses}
      collapseMap={collapseMap}
      onGroupCollapseStateChange={() => {}}
    />
  );
};

describe('<WorkflowCard />', () => {
  it('renders literature workflow card with links', async () => {
    const type = Map({
      key: WorkflowTypes.HEP_CREATE,
      doc_count: 5,
    });
    const statuses = List([Map({ key: WorkflowStatuses.ERROR, doc_count: 2 })]);

    renderWorkflowCard(
      type,
      statuses,
      Map({ 'new arxiv harvests-failed': true })
    );

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

    renderWorkflowCard(type, statuses);

    const viewAll = screen.getByRole('link', { name: /view all/i });
    expect(viewAll).toHaveAttribute(
      'href',
      `${BACKOFFICE_AUTHORS_SEARCH}?workflow_type=${WorkflowTypes.AUTHOR_CREATE}`
    );
  });

  it('renders publisher workflow card with literature route', () => {
    const type = Map({
      key: WorkflowTypes.HEP_PUBLISHER_CREATE,
      doc_count: 4,
    });
    const statuses = List([
      Map({ key: WorkflowStatuses.APPROVAL, doc_count: 1 }),
    ]);

    renderWorkflowCard(type, statuses);

    expect(screen.getByText('new publisher harvests')).toBeInTheDocument();

    const viewAll = screen.getByRole('link', { name: /view all/i });
    expect(viewAll).toHaveAttribute(
      'href',
      `${BACKOFFICE_LITERATURE_SEARCH}?workflow_type=${WorkflowTypes.HEP_PUBLISHER_CREATE}`
    );
  });

  it('renders publisher update workflow card with literature route', () => {
    const type = Map({
      key: WorkflowTypes.HEP_PUBLISHER_UPDATE,
      doc_count: 2,
    });
    const statuses = List([
      Map({ key: WorkflowStatuses.RUNNING, doc_count: 1 }),
    ]);

    renderWorkflowCard(type, statuses);

    expect(screen.getByText('publisher updates')).toBeInTheDocument();

    const viewAll = screen.getByRole('link', { name: /view all/i });
    expect(viewAll).toHaveAttribute(
      'href',
      `${BACKOFFICE_LITERATURE_SEARCH}?workflow_type=${WorkflowTypes.HEP_PUBLISHER_UPDATE}`
    );
  });

  it('renders statuses in the preferred order', async () => {
    const type = Map({
      key: WorkflowTypes.HEP_CREATE,
      doc_count: 5,
    });
    const statuses = List([
      Map({ key: WorkflowStatuses.RUNNING, doc_count: 1 }),
      Map({ key: WorkflowStatuses.APPROVAL_MERGE, doc_count: 1 }),
      Map({ key: WorkflowStatuses.ERROR, doc_count: 1 }),
      Map({ key: WorkflowStatuses.APPROVAL, doc_count: 1 }),
    ]);

    renderWorkflowCard(
      type,
      statuses,
      Map({
        'new arxiv harvests-needs_review': true,
        'new arxiv harvests-failed': true,
        'new arxiv harvests-in_progress': true,
      })
    );

    expect(
      screen
        .getAllByRole('link')
        .slice(1)
        .map((link) => (link as HTMLAnchorElement).href)
    ).toEqual([
      expect.stringContaining(`status=${WorkflowStatuses.APPROVAL}`),
      expect.stringContaining(`status=${WorkflowStatuses.APPROVAL_MERGE}`),
      expect.stringContaining(`status=${WorkflowStatuses.ERROR}`),
      expect.stringContaining(`status=${WorkflowStatuses.RUNNING}`),
    ]);
  });
});
