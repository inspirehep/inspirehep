import React from 'react';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';

import { INSTITUTIONS } from '../routes';
import { getRecordIdFromRef, getInstitutionName } from '../utils';

function Affiliation({ affiliation, unlinked }: { affiliation: Map<string, any>, unlinked?: boolean }) {
  const institutionRecordId = getRecordIdFromRef(
    affiliation.getIn(['record', '$ref']) as string
  );

  const institutionName = getInstitutionName(affiliation);

  return institutionRecordId && !unlinked? (
    <Link to={`${INSTITUTIONS}/${institutionRecordId}`}>{institutionName}</Link>
  ) : (
    <span>{institutionName}</span>
  );
}

export default Affiliation;
