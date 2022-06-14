import React from 'react';
import PropTypes from 'prop-types';

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { AUTHORS } from '../../common/routes';

function ExperimentCollaborationMembersLink({
  recordId
}: any) {
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
