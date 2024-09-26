import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { getPageDisplay } from '../../literature/utils';
import JournalInfo from './JournalInfo';

class PublicationInfo extends Component {
  getPageOrArtidDisplay() {
    const { info } = this.props;

    if (getPageDisplay(info)) {
      return getPageDisplay(info);
    }

    if (info.has('artid')) {
      return info.get('artid');
    }
    return null;
  }

  render() {
    const { info } = this.props;
    const material = info.get('material');
    const journalIssue = info.get('journal_issue');
    const pageOrArtidDisplay = this.getPageOrArtidDisplay();
    if (info.has('journal_title')) {
      return (
        <span>
          <JournalInfo info={info} />
          {pageOrArtidDisplay && journalIssue && <span>,</span>}
          {pageOrArtidDisplay && <span> {pageOrArtidDisplay}</span>}
          {material && material !== 'publication' && <span> ({material})</span>}
        </span>
      );
    }

    if (info.has('pubinfo_freetext')) {
      return <span>{info.get('pubinfo_freetext')}</span>;
    }

    return null;
  }
}

PublicationInfo.propTypes = {
  info: PropTypes.instanceOf(Map).isRequired,
};

export default PublicationInfo;
