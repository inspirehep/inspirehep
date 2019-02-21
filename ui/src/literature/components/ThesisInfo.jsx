import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import InlineList from '../../common/components/InlineList';
import Institution from './Institution';

class ThesisInfo extends Component {
  renderInstutions() {
    const { thesisInfo } = this.props;
    return (
      <InlineList
        wrapperClassName="di"
        items={thesisInfo.get('institutions')}
        extractKey={institution => institution.get('name')}
        renderItem={institution => (
          <Institution institution={institution} />
        )}
      />
    );
  }

  renderDateOrDefenseDate() {
    const { thesisInfo } = this.props;
    const defenseDate = thesisInfo.get('defense_date');
    if (defenseDate) {
      return `(defense: ${defenseDate})`;
    }

    const date = thesisInfo.get('date');
    if (date) {
      return `(${date})`;
    }

    return null;
  }

  render() {
    const { thesisInfo } = this.props;

    if (!thesisInfo) {
      return null;
    }

    const degreeType = thesisInfo.get('degree_type');
    return (
      <span>
        <span>Thesis: </span>
        {degreeType && <span>{degreeType} </span>}
        <span>{this.renderInstutions()} </span>
        <span>{this.renderDateOrDefenseDate()}</span>
      </span>
    );
  }
}

ThesisInfo.propTypes = {
  thesisInfo: PropTypes.instanceOf(Map),
};

ThesisInfo.defaultProps = {
  thesisInfo: null,
};

export default ThesisInfo;
