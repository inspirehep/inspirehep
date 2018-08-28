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

  constructor(props) {
    super(props);
    this.onPageChange = this.onPageChange.bind(this);
    this.state = {
      page: 1,
    };
  }

  onPageChange(page) {
    this.setState({ page });
    this.props.onPageChange(page);
  }

  renderPagination() {
    const { pageItems, loading, total } = this.props;
    const { page } = this.state;
    return (
      <Pagination
        current={page}
        onChange={this.onPageChange}
        total={total}
        pageSize={pageItems.size}
        loading={loading}
        showTotal={ListWithPagination.getPaginationRangeInfo}
      />
    );
  }

  render() {
    const { renderItem, title, pageItems } = this.props;
    const { page } = this.state;
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
  title: PropTypes.node,
  loading: PropTypes.bool,
};

ListWithPagination.defaultProps = {
  title: null,
  loading: false,
};

export default ListWithPagination;
