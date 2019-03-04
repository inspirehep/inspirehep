import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ListItemAction from '../../common/components/ListItemAction';
import EventTracker from '../../common/containers/EventTracker';

class ArxivPdfDownloadAction extends Component {
  render() {
    const { arxivId } = this.props;
    const href = `//arxiv.org/pdf/${arxivId}`;
    return (
      <EventTracker eventId="PdfDownload">
        <ListItemAction
          iconType="download"
          text="pdf"
          link={{
            href,
            target: '_blank',
          }}
        />
      </EventTracker>
    );
  }
}

ArxivPdfDownloadAction.propTypes = {
  arxivId: PropTypes.string.isRequired,
};

export default ArxivPdfDownloadAction;
