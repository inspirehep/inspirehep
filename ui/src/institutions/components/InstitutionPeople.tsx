import React from 'react';

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { AUTHORS } from '../../common/routes';

type Props = {
    recordId: number;
};

function InstitutionPeople({ recordId }: Props) {
  return (
    <span>
      List of{' '}
      <Link to={`${AUTHORS}?q=positions.record.$ref:${recordId}`}>People</Link>
    </span>
  );
}

export default InstitutionPeople;
