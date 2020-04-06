import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';

const PAGE_SIZE_OPTIONS = ['25', '50', '100', '250'];

class SearchPagination extends Component {
  render() {
    const { page, total, pageSize, onPageChange, onSizeChange } = this.props;
    return (
      <Pagination
        hideOnSinglePage
        style={{ textAlign: 'center' }}
        current={page}
        onChange={onPageChange}
        total={total}
        pageSize={pageSize}
        onShowSizeChange={onSizeChange}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        showSizeChanger
        responsive
      />
    );
  }
}

SearchPagination.propTypes = {
  onPageChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

SearchPagination.defaultProps = {
  page: 1,
  pageSize: 25,
};

export default SearchPagination;
