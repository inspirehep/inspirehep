import React from 'react';
import { render, screen } from '@testing-library/react';
import { fromJS } from 'immutable';

import AuthorResultItem from '../AuthorResultItem';
import { WorkflowTypes } from '../../../constants';
import { WorkflowDecisions } from '../../../../common/constants';

describe('AuthorResultItem component', () => {
  const item = fromJS({
    workflow_type: WorkflowTypes.AUTHOR_UPDATE,
    decisions: fromJS([
      {
        action: WorkflowDecisions.ACCEPT,
      },
    ]),
    data: fromJS({
      name: fromJS({
        value: 'Doe, John',
      }),
    }),
  });

  it('renders the AuthorResultItem component', () => {
    render(<AuthorResultItem item={item} />);

    expect(screen.getByText('Doe, John')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();

    const decisionPill = screen.getByText('Accept');
    expect(decisionPill).toBeInTheDocument();
    expect(decisionPill).toHaveClass('decision-pill bg-completed ml1');
  });
});
