import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ListItemAction from '../../common/components/ListItemAction';
import EventTracker from '../../common/components/EventTracker';

class DOILinkAction extends Component {
  render() {
    const { doi } = this.props;
    const href = `//doi.org/${doi}`;
    return (
      <EventTracker eventId="DoiLink">
        <ListItemAction
          iconType="link"
          text="DOI"
          link={{
            href,
            target: '_blank',
          }}
        />
      </EventTracker>
    );
  }
}

DOILinkAction.propTypes = {
  doi: PropTypes.string.isRequired,
};

export default DOILinkAction;
