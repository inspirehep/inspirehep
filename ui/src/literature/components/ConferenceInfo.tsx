import React, { Component } from 'react';
import { Map, List } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import InlineList, { SEPARATOR_AND } from '../../common/components/InlineList';
import { getPageDisplay } from '../utils';

type Props = {
    conferenceInfo: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

class ConferenceInfo extends Component<Props> {

  renderAcronyms() {
    const { conferenceInfo } = this.props;
    return (
      <InlineList
        wrapperClassName="di"
        separator={SEPARATOR_AND}
        items={conferenceInfo.get('acronyms')}
        renderItem={(acronym: $TSFixMe) => <span>{acronym}</span>}
      />
    );
  }

  render() {
    const { conferenceInfo } = this.props;
    const title = conferenceInfo.getIn(['titles', 0, 'title']);
    const acronyms = conferenceInfo.get('acronyms', List());
    const controlNumber = conferenceInfo.get('control_number');

    return (
      <span>
        <Link
          data-test-id="literature-conference-link"
          to={`/conferences/${controlNumber}`}
        >
          {acronyms.size > 0 ? this.renderAcronyms() : title}
        </Link>
        {getPageDisplay(conferenceInfo) && (
          <span>, {getPageDisplay(conferenceInfo)}</span>
        )}
      </span>
    );
  }
}

export default ConferenceInfo;
