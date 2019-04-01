import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'antd';
import ListItemAction from '../../common/components/ListItemAction';
import IconText from '../../common/components/IconText';
import EventTracker from '../../common/components/EventTracker';

class ArxivPdfDownloadAction extends Component {
  render() {
    const { arxivId } = this.props;
    const href = `//arxiv.org/pdf/${arxivId}`;
    return (
      <ListItemAction>
        <EventTracker eventId="PdfDownload">
          <Button href={href} target="_blank">
            <IconText text="pdf" type="download" />
          </Button>
        </EventTracker>
      </ListItemAction>
    );
  }
}

ArxivPdfDownloadAction.propTypes = {
  arxivId: PropTypes.string.isRequired,
};

export default ArxivPdfDownloadAction;
