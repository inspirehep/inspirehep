import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import DOILink from './DOILink';
import InlineList from '../../common/components/InlineList';
import DOIMaterial from './DOIMaterial';

class DOIList extends Component {
  static renderDoiItem(doi: any) {
    const material = doi.get('material');
    const value = doi.get('value');
    return (
      <span>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <DOILink doi={value}>{value}</DOILink>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <DOIMaterial material={material} />
      </span>
    );
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'dois' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { dois } = this.props;

    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="DOI"
        items={dois}
        extractKey={(doi: any) => doi.get('value')}
        renderItem={DOIList.renderDoiItem}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
DOIList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  dois: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
DOIList.defaultProps = {
  dois: null,
};

export default DOIList;
