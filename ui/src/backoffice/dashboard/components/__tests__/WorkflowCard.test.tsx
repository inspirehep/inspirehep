import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { List, Map } from 'immutable';

import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../../fixtures/render';
import { WorkflowStatuses, WorkflowTypes } from '../../../constants';
import {
  BACKOFFICE_AUTHORS_SEARCH,
  BACKOFFICE_LITERATURE_SEARCH,
} from '../../../../common/routes';
import WorkflowCard from '../WorkflowCard';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('<WorkflowCard />', () => {
  it('renders literature workflow card with links', async () => {
    const type = Map({
      key: WorkflowTypes.HEP_CREATE,
      doc_count: 5,
    });
    const statuses = List([Map({ key: WorkflowStatuses.ERROR, doc_count: 2 })]);
    const user = userEvent.setup();

    renderWithRouter(<WorkflowCard type={type} statuses={statuses} />);

    expect(screen.getByText('new arxiv harvests')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    const viewAll = screen.getByRole('link', { name: /view all/i });
    expect(viewAll).toHaveAttribute(
      'href',
      `${BACKOFFICE_LITERATURE_SEARCH}?workflow_type=${WorkflowTypes.HEP_CREATE}`
    );

    await user.click(screen.getByText('Failed'));

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

  it('renders publisher workflow card with literature route', () => {
    const type = Map({
      key: WorkflowTypes.HEP_PUBLISHER_CREATE,
      doc_count: 4,
    });
    const statuses = List([
      Map({ key: WorkflowStatuses.APPROVAL, doc_count: 1 }),
    ]);

    renderWithRouter(<WorkflowCard type={type} statuses={statuses} />);

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

    renderWithRouter(<WorkflowCard type={type} statuses={statuses} />);

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
    const user = userEvent.setup();

    renderWithRouter(<WorkflowCard type={type} statuses={statuses} />);

    await user.click(screen.getByRole('button', { name: /Needs review/ }));
    await user.click(screen.getByRole('button', { name: /Failed/ }));
    await user.click(screen.getByRole('button', { name: /In progress/ }));

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
