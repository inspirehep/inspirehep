import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Tag } from 'antd';

import InlineList from '../../common/components/InlineList';

class ArxivCategoryList extends Component {
  static renderArxivCategory(category) {
    return <Tag>{category}</Tag>;
  }

  render() {
    const { arxivCategories } = this.props;
    return (
      <InlineList
        separateItems={false}
        items={arxivCategories}
        renderItem={ArxivCategoryList.renderArxivCategory}
      />
    );
  }
}

ArxivCategoryList.propTypes = {
  arxivCategories: PropTypes.instanceOf(List),
};

ArxivCategoryList.defaultProps = {
  arxivCategories: null,
};

export default ArxivCategoryList;
