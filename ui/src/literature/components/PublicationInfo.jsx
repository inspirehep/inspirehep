import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

class PublicationInfo extends Component {
  render() {
    const { info } = this.props;
    if (info.has('journal_title')) {
      return (
        <span>
          <i>{info.get('journal_title')}</i>
          {info.has('journal_volume') && <span> {info.get('journal_volume')}</span>}
          {info.has('year') && <span> ({info.get('year')})</span>}
          {info.has('page_start') && info.get('page_end') && <span> {info.get('page_start')}-{info.get('page_end')}</span>}
          {info.has('page_start') && <span> {info.get('page_start')}</span>}
          {info.has('artid') && <span> {info.get('artid')}</span>}
        </span>
      );
    } else if (info.has('pubinfo_freetext')) {
      return (
        <span>{info.get('pubinfo_freetext')}</span>
      );
    }
    return null;
  }
}

PublicationInfo.propTypes = {
  info: PropTypes.instanceOf(Map).isRequired,
};

export default PublicationInfo;
