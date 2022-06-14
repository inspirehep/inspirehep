import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { LITERATURE } from '../../common/routes';

function ExperimentCollaborationArticlesLink({ collaboration }) {
  return (
    <Link to={`${LITERATURE}?q=collaboration:${collaboration.get('value')}`}>
      Collaboration articles
    </Link>
  );
}

ExperimentCollaborationArticlesLink.propTypes = {
  collaboration: PropTypes.instanceOf(Map).isRequired,
};

export default ExperimentCollaborationArticlesLink;
