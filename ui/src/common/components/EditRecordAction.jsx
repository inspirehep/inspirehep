import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ListItemAction from './ListItemAction';
import IconText from './IconText';
import EventTracker from './EventTracker';
import ExternalLink from './ExternalLink';

import { EDIT_LITERATURE, EDIT_JOB } from '../routes';


const pidTypeToEditRoutePrefix = {
  literature: EDIT_LITERATURE,
  jobs: EDIT_JOB,
}

class EditRecordAction extends Component {

  render() {
    const { pidType, pidValue } = this.props;

    return (
      <ListItemAction>
        <EventTracker eventId="Edit">
          <ExternalLink href={`${pidTypeToEditRoutePrefix[pidType]}/${pidValue}`}>
            <IconText text="edit" type="edit" />
          </ExternalLink>
        </EventTracker>
      </ListItemAction>
    );
  }
}

EditRecordAction.propTypes = {
    pidType: PropTypes.oneOf(['literature', 'jobs']).isRequired,
    pidValue: PropTypes.number.isRequired,
};

export default EditRecordAction;
