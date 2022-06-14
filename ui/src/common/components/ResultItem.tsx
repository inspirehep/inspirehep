import React, { Component } from 'react';

import ContentBox from './ContentBox';

type Props = {
    leftActions?: React.ReactNode;
    rightActions?: React.ReactNode;
};

class ResultItem extends Component<Props> {

  render() {
    const { leftActions, rightActions, children } = this.props;
    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <ContentBox leftActions={leftActions} rightActions={rightActions}>
        {children}
      </ContentBox>
    );
  }
}

export default ResultItem;
