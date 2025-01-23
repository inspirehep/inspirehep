import React from 'react';
import { Link } from 'react-router-dom';
import { Map, List } from 'immutable';

import ResultItem from '../../common/components/ResultItem';
import AuthorName from './AuthorName';
import { getCurrentAffiliationsFromPositions } from '../utils';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';
import ExperimentList from '../../common/components/ExperimentList';
import AffiliationList from '../../common/components/AffiliationList';
import EditAuthorRecordAction from './EditAuthorRecordAction';

const AuthorResultItem = ({
  metadata,
  openDetailInNewTab,
  isCatalogerLoggedIn,
}: {
  metadata: Map<string, any>;
  openDetailInNewTab: boolean;
  isCatalogerLoggedIn?: boolean;
}) => {
  const name = metadata.get('name') as Map<string, string>;
  const recordId = metadata.get('control_number') as number;
  const currentPositions = getCurrentAffiliationsFromPositions(
    metadata.get('positions', List()) as Map<string, string>
  );
  const arxivCategories = metadata.get('arxiv_categories');
  const experiments = metadata.get('project_membership');
  const canEdit = metadata.get('can_edit') as boolean;

  return (
    <ResultItem
      leftActions={
        <EditAuthorRecordAction
          pidValue={recordId}
          canEdit={canEdit}
          isCatalogerLoggedIn={isCatalogerLoggedIn || false}
          page="Authors search"
        />
      }
    >
      <Link
        className="result-item-title"
        to={`/authors/${recordId}`}
        target={openDetailInNewTab ? '_blank' : undefined}
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
        <ExperimentList experiments={experiments} wrapperClassName="mt2" />
      </div>
    </ResultItem>
  );
};

AuthorResultItem.defaultProps = {
  openDetailInNewTab: false,
};

export default AuthorResultItem;
