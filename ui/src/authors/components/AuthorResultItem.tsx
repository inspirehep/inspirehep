import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import { Map, List } from 'immutable';

import ResultItem from '../../common/components/ResultItem';
import AuthorName from './AuthorName';
import { getCurrentAffiliationsFromPositions } from '../utils';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';
import ExperimentList from '../../common/components/ExperimentList';
import AffiliationList from '../../common/components/AffiliationList';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import EditAuthorRecordAction from './EditAuthorRecordAction.tsx';

type OwnProps = {
    metadata: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    openDetailInNewTab?: boolean;
    isCatalogerLoggedIn?: boolean;
};

type Props = OwnProps & typeof AuthorResultItem.defaultProps;

class AuthorResultItem extends Component<Props> {

static defaultProps = {
    openDetailInNewTab: false,
};

  render() {
    // TODO: add a Context for `openDetailInNewTab` and use it to make all internal links `target=_blank`
    // for example: right now author profile opens on a new tab, but the detail page of author's affiliation.
    const { metadata, openDetailInNewTab, isCatalogerLoggedIn } = this.props;

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
          <EditAuthorRecordAction
            pidValue={recordId}
            canEdit={canEdit}
            isCatalogerLoggedIn={isCatalogerLoggedIn}
          />
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
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
          <ArxivCategoryList arxivCategories={arxivCategories} />
          <ExperimentList experiments={experiments} />
        </div>
      </ResultItem>
    );
  }
}

export default AuthorResultItem;
