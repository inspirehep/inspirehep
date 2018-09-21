import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import URLLink from './URLLink';
import InlineList from '../../common/components/InlineList';

class URLList extends Component {
  static renderURLItem(url) {
    return (
      <span>
        <URLLink>{url.get('value')}</URLLink>
      </span>
    );
  }

  render() {
    const { urls, wrapperClassName } = this.props;

    return (
      <InlineList
        wrapperClassName={wrapperClassName}
        items={urls}
        extractKey={url => url.get('value')}
        renderItem={url => URLList.renderURLItem(url)}
      />
    );
  }
}

URLList.propTypes = {
  urls: PropTypes.instanceOf(List),
  wrapperClassName: PropTypes.string,
};

URLList.defaultProps = {
  urls: null,
  wrapperClassName: null,
};

export default URLList;
