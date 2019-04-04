import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ListItemAction from '../../common/components/ListItemAction';
import IconText from '../../common/components/IconText';
import EventTracker from '../../common/components/EventTracker';
import ExternalLink from '../../common/components/ExternalLink';

class ArxivPdfDownloadAction extends Component {
  render() {
    const { arxivId } = this.props;
    const href = `//arxiv.org/pdf/${arxivId}`;
    return (
      <ListItemAction>
        <EventTracker eventId="PdfDownload">
          <ExternalLink href={href}>
            <IconText text="pdf" type="download" />
          </ExternalLink>
        </EventTracker>
      </ListItemAction>
    );
  }
}

ArxivPdfDownloadAction.propTypes = {
  arxivId: PropTypes.string.isRequired,
};

export default ArxivPdfDownloadAction;
