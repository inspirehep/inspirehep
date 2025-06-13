import React from 'react';
import { render } from '@testing-library/react';

import EmbeddedSearchBox from '../EmbeddedSearchBox';

describe('ErrorAlert', () => {
  it('renders with all props', () => {
    const { asFragment } = render(
      <EmbeddedSearchBox onSearch={jest.fn()} placeholder="Type to search" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with default message', () => {
    const onSearch = jest.fn();
    const { asFragment } = render(<EmbeddedSearchBox onSearch={onSearch} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
