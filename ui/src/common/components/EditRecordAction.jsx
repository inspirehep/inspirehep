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
import {
  LITERATURE_PID_TYPE,
  JOBS_PID_TYPE,
  CONFERENCES_PID_TYPE,
  AUTHORS_PID_TYPE,
  INSTITUTIONS_PID_TYPE,
  SEMINARS_PID_TYPE,
} from '../constants';

const pidTypeToEditRoutePrefix = {
  literature: EDIT_LITERATURE,
  jobs: EDIT_JOB,
  conferences: EDIT_CONFERENCE,
  authors: EDIT_AUTHOR,
  institutions: EDIT_INSTITUTION,
  seminars: EDIT_SEMINAR,
};

class EditRecordAction extends Component {
  render() {
    const { pidType, pidValue } = this.props;

    return (
      <ListItemAction>
        <EventTracker eventId="Edit">
          <ExternalLink
            href={`${pidTypeToEditRoutePrefix[pidType]}/${pidValue}`}
          >
            <IconText text="edit" icon={<EditOutlined />} />
          </ExternalLink>
        </EventTracker>
      </ListItemAction>
    );
  }
}

EditRecordAction.propTypes = {
  pidType: PropTypes.oneOf([
    LITERATURE_PID_TYPE,
    JOBS_PID_TYPE,
    CONFERENCES_PID_TYPE,
    AUTHORS_PID_TYPE,
    INSTITUTIONS_PID_TYPE,
    SEMINARS_PID_TYPE,
  ]).isRequired,
  pidValue: PropTypes.number.isRequired,
};

export default EditRecordAction;
