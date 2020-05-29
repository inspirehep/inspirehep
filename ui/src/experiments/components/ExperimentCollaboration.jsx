import React from 'react';
import PropTypes from 'prop-types';

import CollaborationLink from '../../common/components/CollaborationLink';

function ExperimentCollaboration({ collaboration }) {
  return (
    <span>
      <CollaborationLink>{collaboration.get('value')}</CollaborationLink>
      {' Collaboration'}
    </span>
  );
}

ExperimentCollaboration.propTypes = {
  collaboration: PropTypes.instanceOf(Map).isRequired,
};

export default ExperimentCollaboration;
