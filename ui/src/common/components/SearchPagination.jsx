import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';

class SearchPagination extends Component {
  render() {
    const { page, total, pageSize, onPageChange } = this.props;
    return (
      <Pagination
        hideOnSinglePage
        style={{ textAlign: 'center' }}
        current={page}
        onChange={onPageChange}
        total={total}
        pageSize={pageSize}
      />
    );
  }
}

SearchPagination.propTypes = {
  onPageChange: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

SearchPagination.defaultProps = {
  page: 1,
  pageSize: 25,
};

export default SearchPagination;
