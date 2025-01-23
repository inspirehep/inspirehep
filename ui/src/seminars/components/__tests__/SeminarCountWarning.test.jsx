import React from 'react';
import { render } from '@testing-library/react';
import SeminarCountWarning from '../SeminarCountWarning';

describe('SeminarCountWarning', () => {
  it('renders', () => {
    const { asFragment } = render(<SeminarCountWarning />);
    expect(asFragment()).toMatchSnapshot();
  });
});
