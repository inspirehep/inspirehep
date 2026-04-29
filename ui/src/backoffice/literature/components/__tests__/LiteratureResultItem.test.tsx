import React from 'react';
import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';

import { renderWithRouter } from '../../../../fixtures/render';
import { WorkflowTypes } from '../../../constants';
import LiteratureResultItem from '../LiteratureResultItem';

describe('LiteratureResultItem component', () => {
  const item = fromJS({
    id: 'wf-123',
    workflow_type: WorkflowTypes.HEP_CREATE,
    data: fromJS({
      titles: fromJS([{ title: 'Test title' }]),
    }),
  });

  it('renders the LiteratureResultItem component', () => {
    renderWithRouter(<LiteratureResultItem item={item} />);

    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.queryByText('Update')).not.toBeInTheDocument();
  });

  it('renders the title as a link to the workflow detail page', () => {
    renderWithRouter(<LiteratureResultItem item={item} />);

    const link = screen.getByRole('link', { name: 'Test title' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('wf-123'));
  });

  it('does not render document type tags when document_type is absent', () => {
    renderWithRouter(<LiteratureResultItem item={item} />);

    expect(screen.queryByText('Article')).not.toBeInTheDocument();
  });

  it('renders a single document type with capitalized first letter', () => {
    const itemWithDocType = fromJS({
      id: 'wf-123',
      workflow_type: WorkflowTypes.HEP_CREATE,
      data: {
        titles: [{ title: 'Test title' }],
        document_type: ['article'],
      },
    });

    renderWithRouter(<LiteratureResultItem item={itemWithDocType} />);

    expect(screen.getByText('Article')).toBeInTheDocument();
  });

  it('renders multiple document types each with capitalized first letter', () => {
    const itemWithDocTypes = fromJS({
      id: 'wf-123',
      workflow_type: WorkflowTypes.HEP_CREATE,
      data: {
        titles: [{ title: 'Test title' }],
        document_type: ['article', 'conference paper'],
      },
    });

    renderWithRouter(<LiteratureResultItem item={itemWithDocTypes} />);

    expect(screen.getByText('Article')).toBeInTheDocument();
    expect(screen.getByText('Conference paper')).toBeInTheDocument();
  });
});
