import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Pagination } from 'antd';
import Immutable from 'immutable';

/**
 * Only displays given page items at once and pagination ui
 * does not paginate.
 * Use `ClientPaginatedList` for complete solution, or implement server one like: `CitationList`
 */
class ListWithPagination extends Component {
  static getPaginationRangeInfo(total, range) {
    return `${range[0]}-${range[1]} of ${total}`;
  }

  renderPagination() {
    const { pageSize, loading, total, page, onPageChange } = this.props;
    return (
      <Pagination
        hideOnSinglePage
        current={page}
        onChange={onPageChange}
        total={total}
        pageSize={pageSize}
        loading={loading}
        showTotal={ListWithPagination.getPaginationRangeInfo}
      />
    );
  }

  render() {
    const { renderItem, title, pageItems, page } = this.props;
    return (
      <List header={title} footer={this.renderPagination()}>
        {pageItems.map((item, index) => renderItem(item, index, page))}
      </List>
    );
  }
}

ListWithPagination.propTypes = {
  total: PropTypes.number.isRequired,
  pageItems: PropTypes.instanceOf(Immutable.List).isRequired,
  renderItem: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  pageSize: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  title: PropTypes.node,
  loading: PropTypes.bool,
};

ListWithPagination.defaultProps = {
  title: null,
  loading: false,
};

export default ListWithPagination;
