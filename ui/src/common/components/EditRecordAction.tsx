import React from 'react';
import { EditOutlined } from '@ant-design/icons';

import ListItemAction from './ListItemAction';
import IconText from './IconText';
import EventTracker from './EventTracker';
import ExternalLink from './ExternalLink';

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
    <ListItemAction>
      <EventTracker eventId="Edit">
        <ExternalLink href={`${pidTypeRoute}/${pidValue}`}>
          <IconText text="edit" icon={<EditOutlined />} />
        </ExternalLink>
      </EventTracker>
    </ListItemAction>
  );
}
