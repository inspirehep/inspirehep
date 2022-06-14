import React, { Component } from 'react';
import { List, Pagination } from 'antd';
import Immutable from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classNames from 'classnames';

const GRID_CONFIG = {
  gutter: 16,
  xs: 1,
  sm: 2,
  lg: 3,
  xl: 4,
};

const PAGE_SIZE_OPTIONS = ['25', '50', '100', '250'];

type OwnProps = {
    total: number;
    pageItems: $TSFixMe; // TODO: PropTypes.instanceOf(Immutable.List)
    renderItem: $TSFixMeFunction;
    onPageChange: $TSFixMeFunction;
    onSizeChange?: $TSFixMeFunction;
    pageSize?: number;
    page?: number;
    title?: React.ReactNode;
    loading?: boolean;
    grid?: boolean;
};

type Props = OwnProps & typeof ListWithPagination.defaultProps;

/**
 * Only displays given page items at once and pagination ui
 * does not paginate.
 * Use `ClientPaginatedList` for complete solution, or implement server one like: `CitationList`
 */
class ListWithPagination extends Component<Props> {

static defaultProps = {
    title: null,
    loading: false,
    page: 1,
    pageSize: 25,
};

  static getPaginationRangeInfo(total: $TSFixMe, range: $TSFixMe) {
    return `${range[0]}-${range[1]} of ${total}`;
  }

  constructor(props: Props) {
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

  renderItem(item: $TSFixMe, index: $TSFixMe) {
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ gutter: number; xs: number; sm: number; lg... Remove this comment to see the full error message
        grid={grid ? GRID_CONFIG : undefined}
        dataSource={pageItems}
        renderItem={this.renderItem}
        data-test-id="pagination-list"
      />
    );
  }
}

export default ListWithPagination;
