import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';

import './SearchPagination.scss';

const PAGE_SIZE_OPTIONS = ['25', '50', '100', '250'];

class SearchPagination extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'page' does not exist on type 'Readonly<{... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SearchPagination.propTypes = {
  onPageChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
SearchPagination.defaultProps = {
  page: 1,
  pageSize: 25,
};

export default SearchPagination;
