import React from 'react';
import PropTypes from 'prop-types';

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { LITERATURE } from '../../common/routes';
import { getPapersQueryString } from '../utils';

function ExperimentAssociatedArticlesLink({
  recordId,
  legacyName
}: any) {
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
