import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList from './InlineList';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from './ExternalLink.tsx';

type OwnProps = {
    urls?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    wrapperClassName?: string;
};

type Props = OwnProps & typeof URLList.defaultProps;

class URLList extends Component<Props> {

static defaultProps = {
    urls: null,
    wrapperClassName: null,
};

  static renderURLItem(url: $TSFixMe) {
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
        extractKey={(url: $TSFixMe) => url.get('value')}
        renderItem={URLList.renderURLItem}
      />
    );
  }
}

export default URLList;
