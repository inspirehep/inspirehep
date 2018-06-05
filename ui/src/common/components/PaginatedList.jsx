import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Pagination } from 'antd';
import Immutable from 'immutable';

class PaginatedList extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { items, pageSize } = nextProps;
    const page = 1;
    const pageItems = PaginatedList.getPageItems(items, page, pageSize);
    return {
      ...prevState,
      pageItems,
      page,
      total: items.size,
    };
  }

  static getPageItems(items, page, pageSize) {
    const endIndex = page * pageSize;
    const startIndex = endIndex - pageSize;
    return items.slice(startIndex, endIndex);
  }

  static getPaginationRangeInfo(total, range) {
    return `${range[0]}-${range[1]} of ${total}`;
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.onPageChange = this.onPageChange.bind(this);
  }

  onPageChange(page) {
    const { pageSize, items } = this.props;
    const pageItems = PaginatedList.getPageItems(items, page, pageSize);
    this.setState({
      page,
      pageItems,
    });
  }

  renderPagination() {
    const { pageSize, loading } = this.props;
    const { total, page } = this.state;
    return (
      <Pagination
        current={page}
        onChange={this.onPageChange}
        total={total}
        pageSize={pageSize}
        loading={loading}
        showTotal={PaginatedList.getPaginationRangeInfo}
      />
    );
  }

  render() {
    const { renderItem, title, items } = this.props;
    const { pageItems } = this.state;
    return (
      items.size > 0 && (
        <List header={title} footer={this.renderPagination()}>
          {pageItems.map(item => renderItem(item))}
        </List>
      )
    );
  }
}

PaginatedList.propTypes = {
  title: PropTypes.node,
  items: PropTypes.instanceOf(Immutable.List),
  renderItem: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  pageSize: PropTypes.number,
};

PaginatedList.defaultProps = {
  items: Immutable.List(),
  title: null,
  pageSize: 25,
  loading: false,
};

export default PaginatedList;
