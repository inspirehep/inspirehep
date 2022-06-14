import React, { Component } from 'react';
import { List } from 'immutable';
import ListWithPagination from './ListWithPagination';

type OwnProps = {
    title?: React.ReactNode;
    items?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    renderItem: $TSFixMeFunction;
    loading?: boolean;
    pageSize?: number;
    grid?: boolean;
};

type State = $TSFixMe;

type Props = OwnProps & typeof ClientPaginatedList.defaultProps;

class ClientPaginatedList extends Component<Props, State> {

static defaultProps = {
    items: List(),
    title: null,
    loading: false,
    pageSize: 25,
};

  static getDerivedStateFromProps(nextProps: $TSFixMe, prevState: $TSFixMe) {
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

  static getPageItems(items: $TSFixMe, page: $TSFixMe, pageSize: $TSFixMe) {
    const endIndex = page * pageSize;
    const startIndex = endIndex - pageSize;
    return items.slice(startIndex, endIndex);
  }

  constructor(props: Props) {
    super(props);
    this.onPageChange = this.onPageChange.bind(this);

    this.state = {
      page: 1,
    };
  }

  onPageChange(page: $TSFixMe) {
    const { items, pageSize } = this.props;
    const pageItems = ClientPaginatedList.getPageItems(items, page, pageSize);
    this.setState({
      pageItems,
      page,
    });
  }

  render() {
    const { renderItem, pageSize, title, items, loading, grid } = this.props;
    const { pageItems, total, page } = this.state;
    return (
      items.size > 0 && (
        <ListWithPagination
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

export default ClientPaginatedList;
