import React, { Component } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

import EventTracker from '../EventTracker';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import FormattedNumber from '../FormattedNumber.tsx';

type OwnProps = {
    name: string;
    loading?: boolean;
    count?: number;
};

type Props = OwnProps & typeof TabNameWithCount.defaultProps;

class TabNameWithCount extends Component<Props> {

static defaultProps = {
    count: null,
    loading: false,
};

  render() {
    const { name, loading, count } = this.props;
    return (
      // @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message
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

export default TabNameWithCount;
