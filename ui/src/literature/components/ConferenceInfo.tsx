import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import InlineList, { SEPARATOR_AND } from '../../common/components/InlineList';
import { getPageDisplay } from '../utils';

class ConferenceInfo extends Component {
  renderAcronyms() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'conferenceInfo' does not exist on type '... Remove this comment to see the full error message
    const { conferenceInfo } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        wrapperClassName="di"
        separator={SEPARATOR_AND}
        items={conferenceInfo.get('acronyms')}
        renderItem={(acronym: any) => <span>{acronym}</span>}
      />
    );
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'conferenceInfo' does not exist on type '... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ConferenceInfo.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  conferenceInfo: PropTypes.instanceOf(Map).isRequired,
};

export default ConferenceInfo;
