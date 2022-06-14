import React, { Component } from 'react';
import { Map } from 'immutable';
import { getPageDisplay } from '../../literature/utils';
import JournalInfo from './JournalInfo';

type Props = {
    info: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

class PublicationInfo extends Component<Props> {

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

export default PublicationInfo;
