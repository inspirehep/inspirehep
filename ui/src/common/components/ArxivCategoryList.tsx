import React, { Component } from 'react';
import { List } from 'immutable';

import UnclickableTag from './UnclickableTag';
import InlineList from './InlineList';

type OwnProps = {
    arxivCategories?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    wrapperClassName?: string;
};

type Props = OwnProps & typeof ArxivCategoryList.defaultProps;

class ArxivCategoryList extends Component<Props> {

static defaultProps = {
    arxivCategories: null,
    wrapperClassName: null,
};

  static renderArxivCategory(category: $TSFixMe) {
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

export default ArxivCategoryList;
