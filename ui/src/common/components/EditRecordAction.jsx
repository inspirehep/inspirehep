import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ListItemAction from './ListItemAction';
import IconText from './IconText';
import EventTracker from './EventTracker';
import ExternalLink from './ExternalLink';

import {
  EDIT_LITERATURE,
  EDIT_JOB,
  EDIT_CONFERENCE,
  EDIT_AUTHOR,
} from '../routes';

const pidTypeToEditRoutePrefix = {
  literature: EDIT_LITERATURE,
  jobs: EDIT_JOB,
  conferences: EDIT_CONFERENCE,
  authors: EDIT_AUTHOR,
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
            <IconText text="edit" type="edit" />
          </ExternalLink>
        </EventTracker>
      </ListItemAction>
    );
  }
}

EditRecordAction.propTypes = {
  pidType: PropTypes.oneOf(['literature', 'jobs', 'conferences', 'authors'])
    .isRequired,
  pidValue: PropTypes.number.isRequired,
};

export default EditRecordAction;
