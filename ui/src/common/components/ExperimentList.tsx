import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import InlineList from './InlineList';
import { EXPERIMENTS } from '../routes';
import { getRecordIdFromRef } from '../utils';

class ExperimentList extends Component {
  static renderExperiment(experiment: any) {
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

  static getExperimentName(experiment: any) {
    return experiment.get('name');
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'experiments' does not exist on type 'Rea... Remove this comment to see the full error message
    const { experiments } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="Experiments"
        items={experiments}
        extractKey={ExperimentList.getExperimentName}
        renderItem={ExperimentList.renderExperiment}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ExperimentList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  experiments: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ExperimentList.defaultProps = {
  experiments: null,
};

export default ExperimentList;
