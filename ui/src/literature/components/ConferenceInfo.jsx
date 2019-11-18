import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import InlineList, { SEPARATOR_AND } from '../../common/components/InlineList';
import { getPageDisplay } from '../utils';

class ConferenceInfo extends Component {
  renderAcronyms() {
    const { conferenceInfo } = this.props;
    return (
      <InlineList
        wrapperClassName="di"
        separator={SEPARATOR_AND}
        items={conferenceInfo.get('acronyms')}
        renderItem={acronym => <span>{acronym}</span>}
      />
    );
  }

  render() {
    const { conferenceInfo } = this.props;
    const title = conferenceInfo.getIn(['titles', 0, 'title']);
    const acronyms = conferenceInfo.get('acronyms', List());

    return (
      <span>
        {acronyms.size > 0 ? this.renderAcronyms() : title}
        {getPageDisplay(conferenceInfo) && (
          <span>, {getPageDisplay(conferenceInfo)}</span>
        )}
      </span>
    );
  }
}

ConferenceInfo.propTypes = {
  conferenceInfo: PropTypes.instanceOf(Map).isRequired,
};

export default ConferenceInfo;
