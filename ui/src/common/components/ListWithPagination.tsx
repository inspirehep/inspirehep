import React from 'react';
import { Pagination, List } from 'antd';
import classNames from 'classnames';

const GRID_CONFIG = {
  gutter: 16,
  xs: 1,
  sm: 2,
  lg: 3,
  xl: 4,
};

const PAGE_SIZE_OPTIONS = ['25', '50', '100', '250'];

function ListWithPagination({
  pageItems,
  pageSize,
  loading,
  total,
  page,
  onPageChange,
  grid,
  onSizeChange,
  renderItem,
  title,
}: {
  pageItems: any[];
  pageSize: number;
  loading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number, pageSize: number) => void;
  grid?: boolean;
  onSizeChange: (current: number, size: number) => void;
  renderItem: Function;
  title: string;
}) {
  function getPaginationRangeInfo(total: number, range: number[]) {
    return `${range[0]}-${range[1]} of ${total}`;
  }

  function renderPagination() {
    return (
      <Pagination
        className={classNames({ 'ant-col-24': grid })}
        hideOnSinglePage
        current={page}
        onChange={onPageChange}
        total={total}
        pageSize={pageSize}
        // @ts-expect-error
        loading={loading}
        showTotal={getPaginationRangeInfo}
        onShowSizeChange={onSizeChange}
        showSizeChanger={onSizeChange != null}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        responsive
      />
    );
  }

  function renderItems(item: any, index: number) {
    const absoluteIndex = (page - 1) * pageSize + index;
    return renderItem(item, absoluteIndex);
  }

  return (
    <List
      header={title}
      footer={renderPagination()}
      grid={grid ? GRID_CONFIG : undefined}
      dataSource={pageItems}
      renderItem={renderItems}
      data-test-id="pagination-list"
    />
  );
}

ListWithPagination.defaultProps = {
  title: null,
  loading: false,
  page: 1,
  pageSize: 25,
};

export default ListWithPagination;
