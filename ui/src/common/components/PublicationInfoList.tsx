import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from './InlineList';
import PublicationInfo from './PublicationInfo';

class PublicationInfoList extends Component {
  render() {
    const { publicationInfo, labeled } = this.props;
    const label = labeled ? 'Published in' : null;
    return (
      <InlineList
        label={label}
        items={publicationInfo}
        extractKey={info =>
          info.get('journal_title') || info.get('pubinfo_freetext')
        }
        renderItem={info => <PublicationInfo info={info} />}
      />
    );
  }
}

PublicationInfoList.propTypes = {
  publicationInfo: PropTypes.instanceOf(List),
  labeled: PropTypes.bool,
};

PublicationInfoList.defaultProps = {
  publicationInfo: null,
  labeled: true,
};

export default PublicationInfoList;
