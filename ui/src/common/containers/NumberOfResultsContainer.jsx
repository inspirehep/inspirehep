import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class NumberOfResultsContainer extends Component {
  render() {
    const { numberOfResults } = this.props;
    return <span>{numberOfResults}</span>;
  }
}

NumberOfResultsContainer.propTypes = {
  numberOfResults: PropTypes.number.isRequired,
};

const stateToProps = state => ({
  numberOfResults: state.search.get('total'),
});

export default connect(stateToProps)(NumberOfResultsContainer);
