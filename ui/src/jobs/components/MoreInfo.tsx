import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import URLList from '../../common/components/URLList';

class MoreInfo extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'urls' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { urls } = this.props;
    return (
      urls && (
        <div>
          <strong>More Information: </strong>
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          <URLList urls={urls} wrapperClassName="di" />
        </div>
      )
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
MoreInfo.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  urls: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
MoreInfo.defaultProps = {
  urls: null,
};

export default MoreInfo;
