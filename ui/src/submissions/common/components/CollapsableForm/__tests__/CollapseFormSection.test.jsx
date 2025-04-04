import React from 'react';
import { render } from '@testing-library/react';

import CollapseFormSection from '../CollapseFormSection';

describe('CollapseFormSection', () => {
  it('renders with all props', () => {
    const { asFragment, getByText } = render(
      <CollapseFormSection header="header" key="some_key" />
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByText('header')).toBeInTheDocument();
  });

  it('renders when header is not present', () => {
    const { asFragment } = render(<CollapseFormSection key="some_key" />);

    expect(asFragment()).toMatchSnapshot();
  });
});
