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
    const { dois, bold } = this.props;

    return (
      <InlineDataList
        label={bold ? <b>DOI</b> : 'DOI'}
        items={dois}
        extractKey={(doi) => doi.get('value')}
        renderItem={DOIList.renderDoiItem}
      />
    );
  }
}

DOIList.propTypes = {
  dois: PropTypes.instanceOf(List),
};

DOIList.defaultProps = {
  dois: null,
};

export default DOIList;
