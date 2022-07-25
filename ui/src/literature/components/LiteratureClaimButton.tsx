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
  controlNumber: number;
}) => {
  const notLoggedInCondidtion = !loggedIn;
  const notAnAuthorContition = !hasAuthorProfile && loggedIn;
  const noAuthorsCondition = hasAuthorProfile && loggedIn && authors && authors.size === 0;
  const hasAuthorsCondition = authors && authors.size > 0;
  const allowClaimingCondition = !notLoggedInCondidtion && !notAnAuthorContition && hasAuthorsCondition;

  return (
    <>
      {notLoggedInCondidtion && <ClaimingDisabledButton />}
      {notAnAuthorContition && <AssignNoProfileAction />}
      {noAuthorsCondition && <NoAuthorsClaimingButton />}
      {allowClaimingCondition && <AssignLiteratureItemContainer controlNumber={controlNumber} />}
    </>
  );
}

export default LiteratureClaimButton;
