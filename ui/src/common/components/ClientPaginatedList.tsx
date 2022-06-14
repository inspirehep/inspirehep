import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ListWithPagination from './ListWithPagination';

class ClientPaginatedList extends Component {
  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    const { items, pageSize } = nextProps;
    const { prevItems, prevPageSize } = prevState;

    if (items === prevItems && pageSize === prevPageSize) {
      return prevState;
    }

    const { page } = prevState;
    const pageItems = ClientPaginatedList.getPageItems(items, page, pageSize);
    return {
      ...prevState,
      prevItems: items,
      prevPageSize: pageSize,
      pageItems,
      total: items.size,
    };
  }

  static getPageItems(items: any, page: any, pageSize: any) {
    const endIndex = page * pageSize;
    const startIndex = endIndex - pageSize;
    return items.slice(startIndex, endIndex);
  }

  constructor(props: any) {
    super(props);
    this.onPageChange = this.onPageChange.bind(this);

    this.state = {
      page: 1,
    };
  }

  onPageChange(page: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'items' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { items, pageSize } = this.props;
    const pageItems = ClientPaginatedList.getPageItems(items, page, pageSize);
    this.setState({
      pageItems,
      page,
    });
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'renderItem' does not exist on type 'Read... Remove this comment to see the full error message
    const { renderItem, pageSize, title, items, loading, grid } = this.props;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'pageItems' does not exist on type 'Reado... Remove this comment to see the full error message
    const { pageItems, total, page } = this.state;
    return (
      items.size > 0 && (
        <ListWithPagination
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ title: any; renderItem: any; pageItems: an... Remove this comment to see the full error message
          title={title}
          renderItem={renderItem}
          pageItems={pageItems}
          pageSize={pageSize}
          page={page}
          onPageChange={this.onPageChange}
          total={total}
          loading={loading}
          grid={grid}
        />
      )
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ClientPaginatedList.propTypes = {
  title: PropTypes.node,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  items: PropTypes.instanceOf(List),
  renderItem: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  pageSize: PropTypes.number,
  grid: PropTypes.bool,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ClientPaginatedList.defaultProps = {
  items: List(),
  title: null,
  loading: false,
  pageSize: 25,
};

export default ClientPaginatedList;
