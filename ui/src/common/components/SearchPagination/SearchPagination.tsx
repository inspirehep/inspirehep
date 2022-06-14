import React, { Component } from 'react';
import { Pagination } from 'antd';

import './SearchPagination.scss';

const PAGE_SIZE_OPTIONS = ['25', '50', '100', '250'];

type OwnProps = {
    onPageChange: $TSFixMeFunction;
    onSizeChange: $TSFixMeFunction;
    total: number;
    page?: number;
    pageSize?: number;
};

type Props = OwnProps & typeof SearchPagination.defaultProps;

class SearchPagination extends Component<Props> {

static defaultProps = {
    page: 1,
    pageSize: 25,
};

  render() {
    const { page, total, pageSize, onPageChange, onSizeChange } = this.props;
    return (
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
        showSizeChanger
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        responsive
      />
    );
  }
}

export default SearchPagination;
