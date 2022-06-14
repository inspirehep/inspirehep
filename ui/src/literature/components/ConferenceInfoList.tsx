import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';
import ConferenceInfo from './ConferenceInfo';

class ConferenceInfoList extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'conferenceInfo' does not exist on type '... Remove this comment to see the full error message
    const { conferenceInfo, wrapperClassName } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        wrapperClassName={wrapperClassName}
        label="Contribution to"
        items={conferenceInfo}
        extractKey={(info: any) => info.get('control_number')}
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        renderItem={(info: any) => <ConferenceInfo conferenceInfo={info} />}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ConferenceInfoList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  conferenceInfo: PropTypes.instanceOf(List),
  wrapperClassName: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ConferenceInfoList.defaultProps = {
  conferenceInfo: null,
  wrapperClassName: null,
};

export default ConferenceInfoList;
