import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import UnclickableTag from './UnclickableTag';
import InlineList from './InlineList';

class ArxivCategoryList extends Component {
  static renderArxivCategory(category: any) {
    return <UnclickableTag>{category}</UnclickableTag>;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'arxivCategories' does not exist on type ... Remove this comment to see the full error message
    const { arxivCategories, wrapperClassName } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        separateItems={false}
        items={arxivCategories}
        renderItem={ArxivCategoryList.renderArxivCategory}
        wrapperClassName={wrapperClassName}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ArxivCategoryList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  arxivCategories: PropTypes.instanceOf(List),
  wrapperClassName: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ArxivCategoryList.defaultProps = {
  arxivCategories: null,
  wrapperClassName: null,
};

export default ArxivCategoryList;
