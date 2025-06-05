import { fireEvent, render } from '@testing-library/react';

import SortBy from '../SortBy';

describe('SortBy', () => {
  it('renders with all props set', () => {
    const { getByText } = render(
      <SortBy
        sort="mostrecent"
        onSortChange={jest.fn()}
        sortOptions={[{ value: 'mostrecent', display: 'Most Recent' }]}
      />
    );

    expect(getByText('Most Recent')).toBeInTheDocument();
  });

  it('does not render if sortOptions missing', () => {
    const { queryByTestId } = render(
      <SortBy sort="mostrecent" onSortChange={jest.fn()} />
    );

    expect(queryByTestId('sort-by-select')).toBeNull();
  });

  it('calls onSortChange when select box change', async () => {
    const onSortChange = jest.fn();
    const { getByRole, getByText } = render(
      <SortBy
        sort="mostrecent"
        onSortChange={onSortChange}
        sortOptions={[
          { value: 'mostrecent', display: 'Most Recent' },
          { value: 'mostcited', display: 'Most Cited' },
        ]}
      />
    );
    const selectBox = getByRole('combobox');
    fireEvent.mouseDown(selectBox);
    const mostCited = getByText('Most Cited');
    fireEvent.click(mostCited);
    expect(onSortChange).toHaveBeenCalledTimes(1);
    expect(onSortChange.mock.calls[0][0]).toBe('mostcited');
  });
});
