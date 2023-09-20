import React from 'react';
import { List, Map } from 'immutable';
import { Link } from 'react-router-dom';

import InlineDataList from './InlineList';
import { EXPERIMENTS } from '../routes';
import { getRecordIdFromRef } from '../utils';

function ExperimentList({ experiments }: { experiments: List<any> }) {
  function renderExperiment(experiment: Map<string, any>) {
    const experimentName = experiment.get('name');
    const experimentRecordId = getRecordIdFromRef(
      experiment.getIn(['record', '$ref']) as string
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

  function getExperimentName(experiment: Map<string, any>) {
    return experiment.get('name');
  }

  return (
    <InlineDataList
      label="Experiments"
      items={experiments}
      extractKey={getExperimentName}
      renderItem={renderExperiment}
    />
  );
}

ExperimentList.defaultProps = {
  experiments: null,
};

export default ExperimentList;
