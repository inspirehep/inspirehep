import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { LITERATURE } from '../../common/routes';

function ExperimentCollaborationArticlesLink({ recordId }) {
  return (
    <Link to={`${LITERATURE}?q=collaboration.value:${recordId}`}>
      Collaboration articles
    </Link>
  );
}

ExperimentCollaborationArticlesLink.propTypes = {
  recordId: PropTypes.number.isRequired,
};

export default ExperimentCollaborationArticlesLink;
