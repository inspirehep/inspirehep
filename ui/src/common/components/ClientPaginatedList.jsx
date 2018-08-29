import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ListWithPagination from './ListWithPagination';

class ClientPaginatedList extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { items, pageSize } = nextProps;
    const pageItems = ClientPaginatedList.getPageItems(items, 1, pageSize);
    return {
      ...prevState,
      pageItems,
      total: items.size,
    };
  }

  static getPageItems(items, page, pageSize) {
    const endIndex = page * pageSize;
    const startIndex = endIndex - pageSize;
    return items.slice(startIndex, endIndex);
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.onPageChange = this.onPageChange.bind(this);
  }

  onPageChange(page) {
    const { items, pageSize } = this.props;
    const pageItems = ClientPaginatedList.getPageItems(items, page, pageSize);
    this.setState({
      pageItems,
    });
  }

  render() {
    const { renderItem, pageSize, title, items, loading } = this.props;
    const { pageItems, total } = this.state;
    return (
      items.size > 0 && (
        <ListWithPagination
          title={title}
          renderItem={renderItem}
          pageItems={pageItems}
          pageSize={pageSize}
          onPageChange={this.onPageChange}
          total={total}
          loading={loading}
        />
      )
    );
  }
}

ClientPaginatedList.propTypes = {
  title: PropTypes.node,
  items: PropTypes.instanceOf(List),
  renderItem: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  pageSize: PropTypes.number,
};

ClientPaginatedList.defaultProps = {
  items: List(),
  title: null,
  loading: false,
  pageSize: 25,
};

export default ClientPaginatedList;
