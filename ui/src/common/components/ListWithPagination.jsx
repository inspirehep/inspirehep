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

const PAGE_SIZE_OPTIONS = ['25', '50', '100', '250'];

/**
 * Only displays given page items at once and pagination ui
 * does not paginate.
 * Use `ClientPaginatedList` for complete solution, or implement server one like: `CitationList`
 */
class ListWithPagination extends Component {
  static getPaginationRangeInfo(total, range) {
    return `${range[0]}-${range[1]} of ${total}`;
  }

  constructor(props) {
    super(props);

    this.renderItem = this.renderItem.bind(this);
  }

  renderPagination() {
    const {
      pageSize,
      loading,
      total,
      page,
      onPageChange,
      grid,
      onSizeChange,
    } = this.props;
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
        onShowSizeChange={onSizeChange}
        showSizeChanger={onSizeChange != null}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        responsive
      />
    );
  }

  renderItem(item, index) {
    const { renderItem, pageSize, page } = this.props;
    const absoluteIndex = (page - 1) * pageSize + index;
    return renderItem(item, absoluteIndex);
  }

  render() {
    const { title, grid, pageItems } = this.props;
    return (
      <List
        header={title}
        footer={this.renderPagination()}
        grid={grid ? GRID_CONFIG : undefined}
        dataSource={pageItems}
        renderItem={this.renderItem}
      />
    );
  }
}

ListWithPagination.propTypes = {
  total: PropTypes.number.isRequired,
  pageItems: PropTypes.instanceOf(Immutable.List).isRequired,
  renderItem: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func,
  pageSize: PropTypes.number,
  page: PropTypes.number,
  title: PropTypes.node,
  loading: PropTypes.bool,
  grid: PropTypes.bool,
};

ListWithPagination.defaultProps = {
  title: null,
  loading: false,
  page: 1,
  pageSize: 25,
};

export default ListWithPagination;
