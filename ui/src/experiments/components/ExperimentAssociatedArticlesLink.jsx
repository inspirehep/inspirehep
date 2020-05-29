import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { LITERATURE } from '../../common/routes';
import { getPapersQueryString } from '../utils';

function ExperimentAssociatedArticlesLink({ recordId, legacyName }) {
  return (
    <Link
      to={`${LITERATURE}?q=${getPapersQueryString(recordId)}`}
    >{`Articles associated with ${legacyName}`}</Link>
  );
}

ExperimentAssociatedArticlesLink.propTypes = {
  recordId: PropTypes.number.isRequired,
  legacyName: PropTypes.string.isRequired,
};

export default ExperimentAssociatedArticlesLink;
