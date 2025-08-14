import { render } from '@testing-library/react';

import ResultItem from '../ResultItem';

describe('ResultItem', () => {
  it('render initial state with all props set', () => {
    const { getByText } = render(
      <ResultItem
        leftActions={
          <ul>
            <li>action 1</li>
            <li>action 2</li>
          </ul>
        }
        rightActions={
          <ul>
            <li>action 3</li>
            <li>action 4</li>
          </ul>
        }
      >
        <span>More</span>
        <span>Content</span>
      </ResultItem>
    );

    expect(getByText('More')).toBeInTheDocument();
    expect(getByText('Content')).toBeInTheDocument();
    expect(getByText('action 1')).toBeInTheDocument();
    expect(getByText('action 2')).toBeInTheDocument();
    expect(getByText('action 3')).toBeInTheDocument();
    expect(getByText('action 4')).toBeInTheDocument();
  });
});
