import React from 'react';

import DisabledEditRecordAction from '../../common/components/DisabledEditRecordAction';
import EditRecordAction from '../../common/components/EditRecordAction';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import PidValue from '../../common/types/PidValue';

type EditAuthorRecordActionProps = {
  isCatalogerLoggedIn: boolean;
  canEdit: boolean;
  pidValue: PidValue;
};

const CAN_NOT_EDIT_AUTHOR_MESSAGE = (
  <span>
    Login to edit your profile. For any changes in other profiles, contact us at{' '}
    <LinkWithTargetBlank href="mailto:authors@inspirehep.net">
      authors@inspirehep.net
    </LinkWithTargetBlank>
  </span>
);

export default function EditAuthorRecordAction({
  isCatalogerLoggedIn,
  canEdit,
  pidValue,
}: EditAuthorRecordActionProps) {
  return canEdit ? (
    <EditRecordAction
      pidType="authors"
      pidValue={pidValue}
      isCatalogerLoggedIn={isCatalogerLoggedIn}
    />
  ) : (
    <DisabledEditRecordAction message={CAN_NOT_EDIT_AUTHOR_MESSAGE} />
  );
}
