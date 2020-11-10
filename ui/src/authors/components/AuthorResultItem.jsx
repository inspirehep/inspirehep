import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Map, List } from 'immutable';

import ResultItem from '../../common/components/ResultItem';
import AuthorName from './AuthorName';
import { getCurrentAffiliationsFromPositions } from '../utils';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';
import ExperimentList from '../../common/components/ExperimentList';
import AffiliationList from '../../common/components/AffiliationList';
import EditAuthorRecordAction from './EditAuthorRecordAction.tsx';

class AuthorResultItem extends Component {
  render() {
    // TODO: add a Context for `openDetailInNewTab` and use it to make all internal links `target=_blank`
    // for example: right now author profile opens on a new tab, but the detail page of author's affiliation.
    const { metadata, openDetailInNewTab } = this.props;

    const name = metadata.get('name');
    const recordId = metadata.get('control_number');
    const currentPositions = getCurrentAffiliationsFromPositions(
      metadata.get('positions', List())
    );
    const arxivCategories = metadata.get('arxiv_categories');
    const experiments = metadata.get('project_membership');
    const canEdit = metadata.get('can_edit');

    return (
      <ResultItem
        leftActions={
          <EditAuthorRecordAction pidValue={recordId} canEdit={canEdit} />
        }
      >
        <Link
          className="result-item-title"
          to={`/authors/${recordId}`}
          target={openDetailInNewTab ? '_blank' : null}
        >
          <AuthorName name={name} />
        </Link>
        {currentPositions.size > 0 && (
          <span className="pl1">
            (
            <AffiliationList affiliations={currentPositions} />)
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
  openDetailInNewTab: PropTypes.bool,
};

AuthorResultItem.defaultProps = {
  openDetailInNewTab: false,
};

export default AuthorResultItem;
