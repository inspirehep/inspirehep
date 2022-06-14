import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import UnclickableTag from './UnclickableTag';
import InlineList from './InlineList';

class ArxivCategoryList extends Component {
  static renderArxivCategory(category) {
    return <UnclickableTag>{category}</UnclickableTag>;
  }

  render() {
    const { arxivCategories, wrapperClassName } = this.props;
    return (
      <InlineList
        separateItems={false}
        items={arxivCategories}
        renderItem={ArxivCategoryList.renderArxivCategory}
        wrapperClassName={wrapperClassName}
      />
    );
  }
}

ArxivCategoryList.propTypes = {
  arxivCategories: PropTypes.instanceOf(List),
  wrapperClassName: PropTypes.string,
};

ArxivCategoryList.defaultProps = {
  arxivCategories: null,
  wrapperClassName: null,
};

export default ArxivCategoryList;
