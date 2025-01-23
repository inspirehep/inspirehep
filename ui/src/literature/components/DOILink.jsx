import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import EventTracker from '../../common/components/EventTracker';

class DOILink extends Component {
  render() {
    const { children, doi, page } = this.props;
    const href = `//doi.org/${doi}`;
    return (
      <EventTracker
        eventCategory={page || 'Literature detail'}
        eventAction="Link"
        eventId="Doi link"
      >
        <LinkWithTargetBlank href={href}>{children}</LinkWithTargetBlank>
      </EventTracker>
    );
  }
}

DOILink.propTypes = {
  children: PropTypes.node.isRequired,
  doi: PropTypes.string.isRequired,
};

export default DOILink;
