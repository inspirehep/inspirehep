import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import InlineList from '../../common/components/InlineList';
import Institution from './Institution';

class ThesisInfo extends Component {
  renderInstutions() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'thesisInfo' does not exist on type 'Read... Remove this comment to see the full error message
    const { thesisInfo } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        wrapperClassName="di"
        items={thesisInfo.get('institutions')}
        extractKey={(institution: any) => institution.get('name')}
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        renderItem={(institution: any) => <Institution institution={institution} />}
      />
    );
  }

  renderDateOrDefenseDate() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'thesisInfo' does not exist on type 'Read... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'thesisInfo' does not exist on type 'Read... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ThesisInfo.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  thesisInfo: PropTypes.instanceOf(Map),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ThesisInfo.defaultProps = {
  thesisInfo: null,
};

export default ThesisInfo;
