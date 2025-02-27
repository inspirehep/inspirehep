import React from 'react';
import { render } from '@testing-library/react';
import AssignNoProfileAction from '../AssignNoProfileAction';

describe('AssignNoProfileAction', () => {
  it('renders', () => {
    const { asFragment } = render(<AssignNoProfileAction />);
    expect(asFragment()).toMatchSnapshot();
  });
});
