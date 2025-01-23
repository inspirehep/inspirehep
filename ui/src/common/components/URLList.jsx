import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineDataList from './InlineList';
import LinkWithTargetBlank from './LinkWithTargetBlank';

class URLList extends Component {
  static renderURLItem(url) {
    return (
      <LinkWithTargetBlank href={url.get('value')}>
        {url.get('value')}
      </LinkWithTargetBlank>
    );
  }

  render() {
    const { urls, wrapperClassName } = this.props;

    return (
      <InlineDataList
        wrapperClassName={wrapperClassName}
        items={urls}
        extractKey={(url) => url.get('value')}
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
