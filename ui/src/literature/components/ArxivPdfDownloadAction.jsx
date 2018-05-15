import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ListItemAction from '../../common/components/ListItemAction';

class ArxivPdfDownloadAction extends Component {
  render() {
    const { arxivId } = this.props;
    const href = `//arxiv.org/pdf/${arxivId}`;
    return (
      <ListItemAction
        iconType="download"
        text="pdf"
        href={href}
        target="_blank"
      />
    );
  }
}

ArxivPdfDownloadAction.propTypes = {
  arxivId: PropTypes.string.isRequired,
};

export default ArxivPdfDownloadAction;
