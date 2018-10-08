import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';

import ResultItem from '../../common/components/ResultItem';
import AuthorName from './AuthorName';
import ArxivCategoryList from './ArxivCategoryList';
import ExperimentList from './ExperimentList';

class AuthorResultItem extends Component {
  render() {
    const { metadata } = this.props;

    const name = metadata.get('name');
    const recordId = metadata.get('control_number');
    const institution = metadata.getIn(['positions', 0, 'institution']);
    const arxivCategories = metadata.get('arxiv_categories');
    const experiments = metadata.get('project_membership');

    return (
      <ResultItem>
        <Link className="f4" to={`/authors/${recordId}`}>
          <AuthorName name={name} />
        </Link>
        {institution && <span className="pl1">({institution})</span>}
        <div className="mt1">
          <ArxivCategoryList arxivCategories={arxivCategories} />
          <ExperimentList experiments={experiments} />
        </div>
      </ResultItem>
    );
  }
}

AuthorResultItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
};

export default AuthorResultItem;
