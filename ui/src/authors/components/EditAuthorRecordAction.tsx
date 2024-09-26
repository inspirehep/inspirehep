import React from 'react';

import DisabledEditRecordAction from '../../common/components/DisabledEditRecordAction';
import EditRecordAction from '../../common/components/EditRecordAction';
import { PidValue } from '../../types';

type EditAuthorRecordActionProps = {
  isCatalogerLoggedIn: boolean;
  canEdit: boolean;
  pidValue: PidValue;
  page: string;
};

const CAN_NOT_EDIT_AUTHOR_MESSAGE = (
  <span>
    Login to edit your profile. For any changes in other profiles{' '}
    <a
      href="https://help.inspirehep.net/knowledge-base/contact-us"
      target="_blank"
    >
      contact us
    </a>
  </span>
);

export default function EditAuthorRecordAction({
  isCatalogerLoggedIn,
  canEdit,
  pidValue,
  page,
}: EditAuthorRecordActionProps) {
  return canEdit ? (
    <EditRecordAction
      pidType="authors"
      pidValue={pidValue}
      isCatalogerLoggedIn={isCatalogerLoggedIn}
      page={page}
    />
  ) : (
    <DisabledEditRecordAction message={CAN_NOT_EDIT_AUTHOR_MESSAGE} />
  );
}
