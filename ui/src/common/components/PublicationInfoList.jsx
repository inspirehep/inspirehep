import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';
import PublicationInfo from './PublicationInfo';

class PublicationInfoList extends Component {
  render() {
    const { publicationInfo, labeled, wrapperClassName } = this.props;
    const label = labeled ? 'Published in' : null;
    return (
      <InlineList
        wrapperClassName={wrapperClassName}
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
  wrapperClassName: PropTypes.string,
};

PublicationInfoList.defaultProps = {
  publicationInfo: null,
  labeled: true,
  wrapperClassName: null,
};

export default PublicationInfoList;
