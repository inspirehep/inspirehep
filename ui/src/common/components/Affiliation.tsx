import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import { INSTITUTIONS } from '../routes';
import { getRecordIdFromRef, getInstitutionName } from '../utils';

type Props = {
    affiliation: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function Affiliation({ affiliation }: Props) {
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

export default Affiliation;
