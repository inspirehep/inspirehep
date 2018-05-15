import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class PublicationInfoList extends Component {
  render() {
    const { publicationInfo } = this.props;
    return (
      <InlineList
        label="Published in"
        items={publicationInfo}
        renderItem={(info) => {
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
        }}
      />
    );
  }
}

PublicationInfoList.propTypes = {
  publicationInfo: PropTypes.instanceOf(List),
};

PublicationInfoList.defaultProps = {
  publicationInfo: null,
};

export default PublicationInfoList;
