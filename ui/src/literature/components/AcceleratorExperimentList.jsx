import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class AcceleratorExperimentList extends Component {
  static getName(experiment) {
    return experiment.get('name');
  }

  render() {
    const { acceleratorExperiments } = this.props;
    return (
      <InlineList
        label="Accelerator experiments"
        items={acceleratorExperiments}
        extractKey={AcceleratorExperimentList.getName}
        renderItem={AcceleratorExperimentList.getName}
      />
    );
  }
}

AcceleratorExperimentList.propTypes = {
  acceleratorExperiments: PropTypes.instanceOf(List),
};

AcceleratorExperimentList.defaultProps = {
  acceleratorExperiments: null,
};

export default AcceleratorExperimentList;
