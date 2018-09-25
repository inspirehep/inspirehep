import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Pagination } from 'antd';

import { pushQueryToLocation } from '../../actions/search';
import { castPropToNumber } from '../utils';

class PaginationContainer extends Component {
  constructor(props) {
    super(props);
    this.onPageChange = this.onPageChange.bind(this);
  }

  onPageChange(page) {
    this.props.onPageChange(page);
  }

  render() {
    return (
      <Pagination
        hideOnSinglePage
        style={{ textAlign: 'center' }}
        current={this.props.page}
        onChange={this.onPageChange}
        total={this.props.total}
        pageSize={this.props.pageSize}
      />
    );
  }
}

PaginationContainer.propTypes = {
  onPageChange: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number,
  pageSize: PropTypes.number,
};

PaginationContainer.defaultProps = {
  page: 1,
  pageSize: 25,
};

const stateToProps = state => ({
  page: castPropToNumber(state.router.location.query.page),
  pageSize: castPropToNumber(state.router.location.query.size),
  total: state.search.get('total'),
});

export const dispatchToProps = dispatch => ({
  onPageChange(page) {
    dispatch(pushQueryToLocation({ page }));
  },
});

export default connect(stateToProps, dispatchToProps)(PaginationContainer);
