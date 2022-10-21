import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank.tsx';
import EventTracker from '../../common/components/EventTracker';

class ArxivEprintLink extends Component {
  get arxivId() {
    const { children } = this.props;
    return children;
  }

  render() {
    const href = `//arxiv.org/abs/${this.arxivId}`;
    return (
      <EventTracker eventId="ArvixEprintLink">
        <LinkWithTargetBlank href={href}>{this.arxivId}</LinkWithTargetBlank>
      </EventTracker>
    );
  }
}

ArxivEprintLink.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ArxivEprintLink;
