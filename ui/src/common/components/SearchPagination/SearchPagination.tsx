import { Pagination } from 'antd';

import './SearchPagination.less';

const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100', '250'];

const SearchPagination = ({
  page = 1,
  total,
  pageSize = 25,
  onPageChange,
  onSizeChange,
  hideSizeChange,
}: {
  page?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  onSizeChange: (current: number, size: number) => void;
  hideSizeChange?: boolean;
}) => (
  <Pagination
    className="__SearchPagination__"
    hideOnSinglePage
    style={{ textAlign: 'center' }}
    current={page}
    onChange={onPageChange}
    total={total}
    pageSize={pageSize}
    onShowSizeChange={onSizeChange}
    pageSizeOptions={PAGE_SIZE_OPTIONS}
    showSizeChanger={!hideSizeChange}
    responsive
  />
);

export default SearchPagination;
