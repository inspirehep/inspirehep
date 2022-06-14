import React, { Component } from 'react';
import { List } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import InlineList from './InlineList';
import { EXPERIMENTS } from '../routes';
import { getRecordIdFromRef } from '../utils';

type OwnProps = {
    experiments?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof ExperimentList.defaultProps;

class ExperimentList extends Component<Props> {

static defaultProps = {
    experiments: null,
};

  static renderExperiment(experiment: $TSFixMe) {
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

  static getExperimentName(experiment: $TSFixMe) {
    return experiment.get('name');
  }

  render() {
    const { experiments } = this.props;
    return (
      <InlineList
        label="Experiments"
        items={experiments}
        extractKey={ExperimentList.getExperimentName}
        renderItem={ExperimentList.renderExperiment}
      />
    );
  }
}

export default ExperimentList;
