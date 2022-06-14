import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from './InlineList';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from './ExternalLink.tsx';

class URLList extends Component {
  static renderURLItem(url: any) {
    return (
      <ExternalLink href={url.get('value')}>{url.get('value')}</ExternalLink>
    );
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'urls' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { urls, wrapperClassName } = this.props;

    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        wrapperClassName={wrapperClassName}
        items={urls}
        extractKey={(url: any) => url.get('value')}
        renderItem={URLList.renderURLItem}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
URLList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  urls: PropTypes.instanceOf(List),
  wrapperClassName: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
URLList.defaultProps = {
  urls: null,
  wrapperClassName: null,
};

export default URLList;
