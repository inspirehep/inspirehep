import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Map, List } from 'immutable';

import ResultItem from '../../common/components/ResultItem';
import AuthorName from './AuthorName';
import { getCurrentAffiliationsFromPositions } from '../utils';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';
import ExperimentList from '../../common/components/ExperimentList';
import EditRecordAction from '../../common/components/EditRecordAction';
import AffiliationList from '../../common/components/AffiliationList';

class AuthorResultItem extends Component {
  render() {
    const { metadata } = this.props;

    const name = metadata.get('name');
    const recordId = metadata.get('control_number');
    const currentPositions = getCurrentAffiliationsFromPositions(
      metadata.get('positions', List())
    );
    const arxivCategories = metadata.get('arxiv_categories');
    const experiments = metadata.get('project_membership');

    return (
      <ResultItem
        leftActions={<EditRecordAction pidType="authors" pidValue={recordId} />}
      >
        <Link className="result-item-title" to={`/authors/${recordId}`}>
          <AuthorName name={name} />
        </Link>
        {currentPositions.size > 0 && (
          <span className="pl1">
            (
            <AffiliationList affiliations={currentPositions} />
            )
          </span>
        )}
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
