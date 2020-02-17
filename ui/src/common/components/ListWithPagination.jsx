import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Pagination } from 'antd';
import Immutable from 'immutable';
import classNames from 'classnames';

const GRID_CONFIG = {
  gutter: 16,
  xs: 1,
  sm: 2,
  lg: 3,
  xl: 4,
};

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
    const { pageSize, loading, total, page, onPageChange, grid } = this.props;
    return (
      <Pagination
        className={classNames({ 'ant-col-24': grid })}
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

  // wrap `
  render() {
    const { renderItem, title, pageItems, page, pageSize, grid } = this.props;
    return (
      <List
        header={title}
        footer={this.renderPagination()}
        grid={grid ? GRID_CONFIG : undefined}
      >
        <div
          className={
            classNames({
              'ant-row-flex': grid,
            }) /* to workaround ant-design/issues/14407 */
          }
        >
          {pageItems.map((item, index) =>
            renderItem(item, (page - 1) * pageSize + index)
          )}
        </div>
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
  grid: PropTypes.bool,
};

ListWithPagination.defaultProps = {
  title: null,
  loading: false,
};

export default ListWithPagination;
