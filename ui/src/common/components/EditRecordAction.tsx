import React from 'react';
import { EditOutlined } from '@ant-design/icons';

import UserAction from './UserAction';
import IconText from './IconText';
import EventTracker from './EventTracker';
import LinkWithTargetBlank from './LinkWithTargetBlank';

import {
  EDIT_LITERATURE,
  EDIT_JOB,
  EDIT_CONFERENCE,
  EDIT_AUTHOR,
  EDIT_AUTHOR_CATALOGER,
  EDIT_INSTITUTION,
  EDIT_SEMINAR,
  EDIT_JOURNAL,
  EDIT_EXPERIMENT
} from '../routes';
import PidType from '../types/PidType';
import PidValue from '../types/PidValue';

const pidTypeToEditRoutePrefix = {
  literature: EDIT_LITERATURE,
  jobs: EDIT_JOB,
  conferences: EDIT_CONFERENCE,
  authors: EDIT_AUTHOR,
  institutions: EDIT_INSTITUTION,
  seminars: EDIT_SEMINAR,
  journals: EDIT_JOURNAL,
  experiments: EDIT_EXPERIMENT
};

interface EditRecordActionProps {
  pidType: PidType;
  pidValue: PidValue;
  isCatalogerLoggedIn: boolean;
}

export default function EditRecordAction({
  pidType,
  pidValue,
  isCatalogerLoggedIn,
}: EditRecordActionProps) {
  const pidTypeRoute =
    pidType === 'authors' && isCatalogerLoggedIn
      ? EDIT_AUTHOR_CATALOGER
      : pidTypeToEditRoutePrefix[pidType];

  return (
    <UserAction>
      <EventTracker eventId="Edit">
        <LinkWithTargetBlank href={`${pidTypeRoute}/${pidValue}`}>
          <IconText text="edit" icon={<EditOutlined />} />
        </LinkWithTargetBlank>
      </EventTracker>
    </UserAction>
  );
}
