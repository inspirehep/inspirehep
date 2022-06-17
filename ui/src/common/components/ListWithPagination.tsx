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
  static getPaginationRangeInfo(total: any, range: any) {
    return `${range[0]}-${range[1]} of ${total}`;
  }

  constructor(props: any) {
    super(props);

    this.renderItem = this.renderItem.bind(this);
  }

  renderPagination() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'pageSize' does not exist on type 'Readon... Remove this comment to see the full error message
      pageSize,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'loading' does not exist on type 'Readonl... Remove this comment to see the full error message
      loading,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'total' does not exist on type 'Readonly<... Remove this comment to see the full error message
      total,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'page' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      page,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onPageChange' does not exist on type 'Re... Remove this comment to see the full error message
      onPageChange,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'grid' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      grid,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSizeChange' does not exist on type 'Re... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        loading={loading}
        showTotal={ListWithPagination.getPaginationRangeInfo}
        onShowSizeChange={onSizeChange}
        showSizeChanger={onSizeChange != null}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        responsive
      />
    );
  }

  renderItem(item: any, index: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'renderItem' does not exist on type 'Read... Remove this comment to see the full error message
    const { renderItem, pageSize, page } = this.props;
    const absoluteIndex = (page - 1) * pageSize + index;
    return renderItem(item, absoluteIndex);
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'title' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { title, grid, pageItems } = this.props;
    return (
      <List
        header={title}
        footer={this.renderPagination()}
        grid={grid ? GRID_CONFIG : undefined}
        dataSource={pageItems}
        renderItem={this.renderItem}
        data-test-id="pagination-list"
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ListWithPagination.propTypes = {
  total: PropTypes.number.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ListWithPagination.defaultProps = {
  title: null,
  loading: false,
  page: 1,
  pageSize: 25,
};

export default ListWithPagination;
