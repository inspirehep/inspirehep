import React from 'react';
import { List } from 'immutable';

import ClaimingDisabledButton from '../../authors/components/ClaimingDisabledButton';
import AssignNoProfileAction from '../../authors/components/AssignNoProfileAction';
import AssignLiteratureItemContainer from '../containers/AssignLiteratureItemContainer';
import NoAuthorsClaimingButton from './NoAuthorsClaimingButton';

const LiteratureClaimButton = ({
  loggedIn,
  hasAuthorProfile,
  authors,
  controlNumber,
}: {
  loggedIn: boolean;
  hasAuthorProfile: boolean;
  authors: List<{}>;
  controlNumber: string;
}) => (
  <>
    {!loggedIn && <ClaimingDisabledButton />}
    {!hasAuthorProfile && <AssignNoProfileAction />}
    {authors.size === 0 && <NoAuthorsClaimingButton />}
    {loggedIn && hasAuthorProfile && authors.size > 0 && <AssignLiteratureItemContainer controlNumber={controlNumber} />}
  </>
);

export default LiteratureClaimButton;
