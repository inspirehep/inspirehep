import React from 'react';
import { render, screen } from '@testing-library/react';
import { fromJS } from 'immutable';

import { WorkflowTypes } from '../../../constants';
import LiteratureResultItem from '../LiteratureResultItem';

describe('LiteratureResultItem component', () => {
  const item = fromJS({
    workflow_type: WorkflowTypes.HEP_CREATE,
    data: fromJS({
      titles: fromJS([
        {
          title: 'Test title',
        },
      ]),
    }),
  });

  it('renders the LiteratureResultItem component', () => {
    render(<LiteratureResultItem item={item} />);

    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.queryByText('Update')).not.toBeInTheDocument();
  });
});
