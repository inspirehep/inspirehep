import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import DOILink from './DOILink';
import InlineList from '../../common/components/InlineList';
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
    const { dois, wrapperClassName } = this.props;

    return (
      <InlineList
        wrapperClassName={wrapperClassName}
        label="DOI"
        items={dois}
        extractKey={doi => doi.get('value')}
        renderItem={DOIList.renderDoiItem}
      />
    );
  }
}

DOIList.propTypes = {
  dois: PropTypes.instanceOf(List),
  wrapperClassName: PropTypes.string,
};

DOIList.defaultProps = {
  dois: null,
  wrapperClassName: null,
};

export default DOIList;
