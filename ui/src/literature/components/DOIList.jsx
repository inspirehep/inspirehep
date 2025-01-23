import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import DOILink from './DOILink';
import InlineDataList from '../../common/components/InlineList';
import DOIMaterial from './DOIMaterial';

class DOIList extends Component {
  static renderDoiItem(doi) {
    const material = doi.get('material');
    const value = doi.get('value');
    return (
      <span>
        <DOILink doi={value}>{value}</DOILink>
        <DOIMaterial material={material} />
      </span>
    );
  }

  render() {
    const { dois, showLabel } = this.props;

    return (
      <InlineDataList
        label={showLabel ? 'DOI' : null}
        items={dois}
        extractKey={(doi) => doi.get('value')}
        renderItem={DOIList.renderDoiItem}
      />
    );
  }
}

DOIList.propTypes = {
  dois: PropTypes.instanceOf(List),
  showLabel: PropTypes.bool,
};

DOIList.defaultProps = {
  dois: null,
  showLabel: true,
};

export default DOIList;
