import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

class PublicationInfo extends Component {
  displayArtidPageInfoAndJournalIssue() {
    const { info } = this.props;
    if (info.has('page_start') && info.has('page_end')) {
      return (
        <span>
          <span>
            {' '}
            {info.get('page_start')}-{info.get('page_end')}
          </span>
        </span>
      );
    } else if (info.has('page_start')) {
      return (
        <span>
          <span> {info.get('page_start')}</span>
        </span>
      );
    } else if (info.has('artid')) {
      return (
        <span>
          <span> {info.get('artid')}</span>
        </span>
      );
    }
    return null;
  }

  render() {
    const { info } = this.props;
    const material = info.get('material');

    if (info.has('journal_title')) {
      return (
        <span>
          <i>{info.get('journal_title')}</i>
          {info.has('journal_volume') && (
            <span> {info.get('journal_volume')}</span>
          )}
          {info.has('year') && <span> ({info.get('year')})</span>}
          {this.displayArtidPageInfoAndJournalIssue()}
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
