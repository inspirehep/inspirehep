import React from 'react';
import { render } from '@testing-library/react';
import FormattedNumber from '../FormattedNumber';

describe('FormattedNumber', () => {
  it('renders with children', () => {
    const { getByText } = render(<FormattedNumber>{1243553}</FormattedNumber>);
    expect(getByText('1,243,553')).toBeInTheDocument();
  });
});
