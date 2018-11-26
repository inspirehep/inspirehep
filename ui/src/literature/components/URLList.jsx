import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';
import ExternalLink from '../../common/components/ExternalLink';

class URLList extends Component {
  static renderURLItem(url) {
    return (
      <ExternalLink href={url.get('value')}>{url.get('value')}</ExternalLink>
    );
  }

  render() {
    const { urls, wrapperClassName } = this.props;

    return (
      <InlineList
        wrapperClassName={wrapperClassName}
        items={urls}
        extractKey={url => url.get('value')}
        renderItem={URLList.renderURLItem}
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
