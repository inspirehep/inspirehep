import { render } from '@testing-library/react';
import { fromJS, Range } from 'immutable';
import { List } from 'antd';

import ClientPaginatedList from '../ClientPaginatedList';

describe('ClientPaginatedList', () => {
  it('renders first page', () => {
    const items = Range(1, 100).toList();
    const { container, getByText } = render(
      <ClientPaginatedList
        items={items}
        renderItem={(item) => <List.Item key={item}>{item}</List.Item>}
      />
    );

    expect(getByText('1-25 of 99')).toBeInTheDocument();
    const element = container.querySelector('.ant-pagination-item-active');
    expect(element.textContent).toBe('1');
  });

  it('renders first page with custom pageSize', () => {
    const items = Range(1, 100).toList();
    const { getByText, container } = render(
      <ClientPaginatedList
        items={items}
        pageSize={10}
        renderItem={(item) => <List.Item key={item}>{item}</List.Item>}
      />
    );
    expect(getByText('1-10 of 99')).toBeInTheDocument();
    const element = container.querySelector('.ant-pagination-item-active');
    expect(element.textContent).toBe('1');
  });

  it('renders as loading if set', () => {
    const items = Range(1, 100).toList();
    const { getByText } = render(
      <ClientPaginatedList
        loading
        items={items}
        renderItem={(item) => <List.Item key={item}>{item}</List.Item>}
        pageSize={10}
      />
    );

    expect(getByText('•••')).toBeInTheDocument();
  });

  it('renders in grid mode', () => {
    const items = Range(1, 100).toList();
    const { getByTestId } = render(
      <ClientPaginatedList
        loading
        items={items}
        renderItem={(item) => <List.Item key={item}>{item}</List.Item>}
        pageSize={10}
        grid
      />
    );
    expect(getByTestId('pagination-list')).toHaveClass('ant-list-grid');
  });

  it('renders the new page on page change', () => {
    const items = Range(1, 100).toList();
    const { container, getAllByRole } = render(
      <ClientPaginatedList
        items={items}
        renderItem={(item) => <List.Item key={item}>{item}</List.Item>}
        pageSize={10}
      />
    );

    expect(
      container.querySelector('.ant-pagination-item-active').textContent
    ).toBe('1');

    getAllByRole('button')[1].click();

    expect(
      container.querySelector('.ant-pagination-item-active').textContent
    ).toBe('2');
  });

  it('does not render at all if empty', () => {
    const items = fromJS([]);
    const { container } = render(
      <ClientPaginatedList
        items={items}
        renderItem={(item) => <List.Item key={item}>{item}</List.Item>}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  describe('getPageItems', () => {
    it('returns items for a page', () => {
      const items = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const page = 2;
      const pageSize = 3;
      const expected = fromJS([4, 5, 6]);
      const result = ClientPaginatedList.getPageItems(items, page, pageSize);
      expect(result).toEqual(expected);
    });

    it('returns items for the first page', () => {
      const items = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const page = 1;
      const pageSize = 3;
      const expected = fromJS([1, 2, 3]);
      const result = ClientPaginatedList.getPageItems(items, page, pageSize);
      expect(result).toEqual(expected);
    });

    it('returns only remaining items for the last page', () => {
      const items = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const page = 4;
      const pageSize = 3;
      const expected = fromJS([10]);
      const result = ClientPaginatedList.getPageItems(items, page, pageSize);
      expect(result).toEqual(expected);
    });
  });
});
