import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';

class ResultsContainer extends Component {
  render() {
    return (
      <div>
        {this.props.results.map(result => (
          <div className="mv3" key={result.get('id')}>
            {this.props.renderItem(result)}
          </div>
        ))}
      </div>
    );
  }
}

ResultsContainer.propTypes = {
  results: PropTypes.instanceOf(Immutable.List),
  renderItem: PropTypes.func.isRequired,
};

ResultsContainer.defaultProps = {
  results: Immutable.List(),
};

const stateToProps = state => ({
  results: state.search.get('results'),
});

export default connect(stateToProps)(ResultsContainer);
