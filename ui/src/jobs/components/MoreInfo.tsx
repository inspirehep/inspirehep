import React, { Component } from 'react';
import { List } from 'immutable';
import URLList from '../../common/components/URLList';

type OwnProps = {
    urls?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof MoreInfo.defaultProps;

class MoreInfo extends Component<Props> {

static defaultProps = {
    urls: null,
};

  render() {
    const { urls } = this.props;
    return (
      urls && (
        <div>
          <strong>More Information: </strong>
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
          <URLList urls={urls} wrapperClassName="di" />
        </div>
      )
    );
  }
}

export default MoreInfo;
