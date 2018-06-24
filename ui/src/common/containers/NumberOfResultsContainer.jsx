import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class NumberOfResultsContainer extends Component {
  render() {
    const { numberOfResults } = this.props;
    return (
      <span>
        {numberOfResults} {numberOfResults === 1 ? 'result' : 'results'} found.
      </span>
    );
  }
}

NumberOfResultsContainer.propTypes = {
  numberOfResults: PropTypes.number.isRequired,
};

const stateToProps = state => ({
  numberOfResults: state.search.get('total'),
});

export default connect(stateToProps)(NumberOfResultsContainer);
