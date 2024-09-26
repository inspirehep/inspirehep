import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { AUTHORS } from '../../common/routes';

function ExperimentCollaborationMembersLink({ recordId }) {
  return (
    <Link to={`${AUTHORS}?q=project_membership.record.$ref:${recordId}`}>
      Collaboration members
    </Link>
  );
}

ExperimentCollaborationMembersLink.propTypes = {
  recordId: PropTypes.number.isRequired,
};

export default ExperimentCollaborationMembersLink;
