import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from './InlineList';

class ExperimentList extends Component {
  static renderExperiment(experiment) {
    return experiment.get('name');
  }

  render() {
    const { experiments } = this.props;
    return (
      <InlineList
        label="Experiments"
        items={experiments}
        renderItem={ExperimentList.renderExperiment}
      />
    );
  }
}

ExperimentList.propTypes = {
  experiments: PropTypes.instanceOf(List),
};

ExperimentList.defaultProps = {
  experiments: null,
};

export default ExperimentList;
