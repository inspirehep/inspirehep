import React from 'react';

// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { LITERATURE } from '../../common/routes';
import { getPapersQueryString } from '../utils';

type Props = {
    recordId: number;
    legacyName: string;
};

function ExperimentAssociatedArticlesLink({ recordId, legacyName }: Props) {
  return (
    <Link
      to={`${LITERATURE}?q=${getPapersQueryString(recordId)}`}
    >{`Articles associated with ${legacyName}`}</Link>
  );
}

export default ExperimentAssociatedArticlesLink;
