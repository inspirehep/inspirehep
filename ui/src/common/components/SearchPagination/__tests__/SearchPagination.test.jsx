import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('calls onPageChange when pagination change', async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    const { getByText } = render(
      <SearchPagination total={100} onPageChange={onPageChange} />
    );
    const page = getByText('3');

    await user.click(page);

    expect(onPageChange).toBeCalledTimes(1);
    expect(onPageChange).toBeCalledWith(3, 25);
  });
});
