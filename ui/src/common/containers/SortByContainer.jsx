import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SelectBox from '../components/SelectBox';
import { pushQueryToLocation } from '../../actions/search';

const options = [
  {
    display: 'Most Recent',
    value: 'mostrecent',
  },
  {
    display: 'Most Cited',
    value: 'mostcited',
  }
];

class SortByContainer extends Component {
  constructor(props) {
    super(props);
    this.onSortChange = this.onSortChange.bind(this);
  }

  onSortChange(page) {
    this.props.onSortChange(page);
  }

  render() {
    return (
      <SelectBox
        onChange={this.onSortChange}
        defaultValue={this.props.sort}
        options={options}
      />
    );
  }
}

SortByContainer.propTypes = {
  onSortChange: PropTypes.func.isRequired,
  sort: PropTypes.string,
};

SortByContainer.defaultProps = {
  sort: options[0].value,
};

const stateToProps = state => ({
  sort: state.router.location.query.sort,
});

export const dispatchToProps = dispatch => ({
  onSortChange(sort) {
    dispatch(pushQueryToLocation({ sort }));
  },
});

export default connect(stateToProps, dispatchToProps)(SortByContainer);
