import React from 'react';
import { render } from '@testing-library/react';

import JsonDiff from '../JsonDiff';

describe('JsonDiff', () => {
  it('renders diff', () => {
    const first = {
      id: 1,
      foo: 'bar',
      another: 'value',
    };
    const second = {
      id: 2,
      foo: 'not bar',
    };
    const { container } = render(<JsonDiff first={first} second={second} />);
    expect(container).toMatchSnapshot();
  });
});
