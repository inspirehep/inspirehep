import { render } from '@testing-library/react';

import SearchPagination from '../SearchPagination';

describe('SearchPagination', () => {
  it('renders with all props set', () => {
    const { asFragment } = render(
      <SearchPagination
        total={100}
        onPageChange={jest.fn()}
        page={2}
        pageSize={10}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with only required props set', () => {
    const { asFragment } = render(
      <SearchPagination total={100} onPageChange={jest.fn()} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onPageChange when pagination change', () => {
    const onPageChange = jest.fn();
    const { getByText } = render(
      <SearchPagination total={100} onPageChange={onPageChange} />
    );
    getByText('3').click();
    expect(onPageChange).toBeCalledTimes(1);
    expect(onPageChange).toBeCalledWith(3, 25);
  });
});
