import React from 'react';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import { INSTITUTIONS } from '../routes';
import { getRecordIdFromRef, getInstitutionName } from '../utils';

function AuthorAffiliation({ affiliation }) {
  const institutionRecordId = getRecordIdFromRef(
    affiliation.getIn(['record', '$ref'])
  );

  const institutionName = getInstitutionName(affiliation);

  return institutionRecordId ? (
    <Link to={`${INSTITUTIONS}/${institutionRecordId}`}>{institutionName}</Link>
  ) : (
    <span>{institutionName}</span>
  );
}

AuthorAffiliation.propTypes = {
  affiliation: PropTypes.instanceOf(Map).isRequired,
};

export default AuthorAffiliation;
