import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
  EDIT_INSTITUTION,
  EDIT_SEMINAR,
} from '../routes';
import PidType from '../types/PidType';

const pidTypeToEditRoutePrefix = {
  literature: EDIT_LITERATURE,
  jobs: EDIT_JOB,
  conferences: EDIT_CONFERENCE,
  authors: EDIT_AUTHOR,
  institutions: EDIT_INSTITUTION,
  seminars: EDIT_SEMINAR,
};

interface EditRecordActionProps {
  pidType: PidType;
  pidValue: number;
}

export default function EditRecordAction({
  pidType,
  pidValue,
}: EditRecordActionProps) {
  return (
    <ListItemAction>
      <EventTracker eventId="Edit">
        <ExternalLink href={`${pidTypeToEditRoutePrefix[pidType]}/${pidValue}`}>
          <IconText text="edit" icon={<EditOutlined />} />
        </ExternalLink>
      </EventTracker>
    </ListItemAction>
  );
}
