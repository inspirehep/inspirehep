import React from 'react';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import { INSTITUTIONS } from '../routes';
import { getRecordIdFromRef, getInstitutionName } from '../utils';

function Affiliation({
  affiliation
}: any) {
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

Affiliation.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  affiliation: PropTypes.instanceOf(Map).isRequired,
};

export default Affiliation;
