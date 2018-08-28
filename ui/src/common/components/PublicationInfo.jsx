import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

class PublicationInfo extends Component {
  getPageOrArtidDisplay() {
    const { info } = this.props;
    if (info.has('page_start') && info.has('page_end')) {
      return `${info.get('page_start')}-${info.get('page_end')}`;
    } else if (info.has('page_start')) {
      return info.get('page_start');
    } else if (info.has('artid')) {
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
          <i>{info.get('journal_title')}</i>
          {info.has('journal_volume') && (
            <span> {info.get('journal_volume')}</span>
          )}
          {info.has('year') && <span> ({info.get('year')})</span>}
          {journalIssue && <span> {journalIssue}</span>}
          {pageOrArtidDisplay && journalIssue && <span>,</span>}
          {pageOrArtidDisplay && <span> {pageOrArtidDisplay}</span>}
          {material && material !== 'publication' && <span> ({material})</span>}
        </span>
      );
    } else if (info.has('pubinfo_freetext')) {
      return <span>{info.get('pubinfo_freetext')}</span>;
    }
    return null;
  }
}

PublicationInfo.propTypes = {
  info: PropTypes.instanceOf(Map).isRequired,
};

export default PublicationInfo;
