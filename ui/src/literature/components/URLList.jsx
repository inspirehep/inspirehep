import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import InlineList from '../../common/components/InlineList';

class URLList extends Component {
  static renderURLItem(url) {
    return (
      <a target="_blank" href={url.get('value')}>
        {url.get('value')}
      </a>
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
