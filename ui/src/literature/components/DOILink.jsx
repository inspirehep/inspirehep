import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank.tsx';
import EventTracker from '../../common/components/EventTracker';

class DOILink extends Component {
  render() {
    const { children, doi } = this.props;
    const href = `//doi.org/${doi}`;
    return (
      <EventTracker eventId="DoiLink">
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
