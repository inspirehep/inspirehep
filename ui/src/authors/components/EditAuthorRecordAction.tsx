import React from 'react';
import DisabledEditRecordAction from '../../common/components/DisabledEditRecordAction';
import EditRecordAction from '../../common/components/EditRecordAction';
import ExternalLink from '../../common/components/ExternalLink';
import PidValue from '../../common/types/PidValue';

type EditAuthorRecordActionProps = {
  canEdit: boolean;
  pidValue: PidValue;
};

const CAN_NOT_EDIT_AUTHOR_MESSAGE = (
  <span>
    Login to edit your profile. For any changes in other profiles, contact us at{' '}
    <ExternalLink href="mailto:authors@inspirehep.net">
      authors@inspirehep.net
    </ExternalLink>
  </span>
);

export default function EditAuthorRecordAction({
  canEdit,
  pidValue,
}: EditAuthorRecordActionProps) {
  return canEdit ? (
    <EditRecordAction pidType="authors" pidValue={pidValue} />
  ) : (
    <DisabledEditRecordAction message={CAN_NOT_EDIT_AUTHOR_MESSAGE} />
  );
}
