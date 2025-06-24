import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import SupervisorList from '../SupervisorList';

describe('SupervisorList', () => {
  it('renders with multiple supervisors', () => {
    const supervisors = fromJS([
      {
        uuid: '123',
        full_name: 'John Doe',
      },
      {
        uuid: '456',
        full_name: 'Jane Doe',
      },
    ]);
    const { asFragment } = render(<SupervisorList supervisors={supervisors} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with one supervisor', () => {
    const supervisors = fromJS([
      {
        uuid: '123',
        full_name: 'John Doe',
      },
    ]);
    const { asFragment } = render(<SupervisorList supervisors={supervisors} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
