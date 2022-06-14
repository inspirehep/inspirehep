import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LoadingOutlined } from '@ant-design/icons';

import EventTracker from '../EventTracker';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import FormattedNumber from '../FormattedNumber.tsx';

class TabNameWithCount extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { name, loading, count } = this.props;
    return (
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; eventId: string; }' is ... Remove this comment to see the full error message
      <EventTracker eventId={`${name}-Tab`}>
        <span>
          <span>{name}</span>
          <span className="ml1">
            {loading ? (
              <span data-test-id="loading">
                <LoadingOutlined className="ml1" spin />
              </span>
            ) : (
              count != null && (
                <span>
                  (<FormattedNumber>{count}</FormattedNumber>)
                </span>
              )
            )}
          </span>
        </span>
      </EventTracker>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
TabNameWithCount.propTypes = {
  name: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  count: PropTypes.number,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
TabNameWithCount.defaultProps = {
  count: null,
  loading: false,
};

export default TabNameWithCount;
