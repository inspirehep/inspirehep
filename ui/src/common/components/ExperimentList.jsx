import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Link } from 'react-router-dom';

import InlineDataList from './InlineList';
import { EXPERIMENTS } from '../routes';
import { getRecordIdFromRef } from '../utils';

class ExperimentList extends Component {
  static renderExperiment(experiment) {
    const experimentName = experiment.get('name');
    const experimentRecordId = getRecordIdFromRef(
      experiment.getIn(['record', '$ref'])
    );
    if (experimentRecordId) {
      return (
        <Link to={`${EXPERIMENTS}/${experimentRecordId}`}>
          {experimentName}
        </Link>
      );
    }
    return experimentName;
  }

  static getExperimentName(experiment) {
    return experiment.get('name');
  }

  render() {
    const { experiments, wrapperClassName } = this.props;
    return (
      <InlineDataList
        label="Experiments"
        items={experiments}
        extractKey={ExperimentList.getExperimentName}
        renderItem={ExperimentList.renderExperiment}
        wrapperClassName={wrapperClassName}
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
