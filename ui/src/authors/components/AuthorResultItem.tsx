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
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import EditAuthorRecordAction from './EditAuthorRecordAction.tsx';

class AuthorResultItem extends Component {
  render() {
    // TODO: add a Context for `openDetailInNewTab` and use it to make all internal links `target=_blank`
    // for example: right now author profile opens on a new tab, but the detail page of author's affiliation.
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'metadata' does not exist on type 'Readon... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
          target={openDetailInNewTab ? '_blank' : undefined}
        >
          {/* @ts-ignore */}
          <AuthorName name={name} />
        </Link>
        {currentPositions.size > 0 && (
          <span className="pl1">
            (
            {/* @ts-ignore */}
            <AffiliationList affiliations={currentPositions} />)
          </span>
        )}
        <div className="mt1">
          {/* @ts-ignore */}
          <ArxivCategoryList arxivCategories={arxivCategories} />
          {/* @ts-ignore */}
          <ExperimentList experiments={experiments} />
        </div>
      </ResultItem>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AuthorResultItem.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  metadata: PropTypes.instanceOf(Map).isRequired,
  openDetailInNewTab: PropTypes.bool,
  isCatalogerLoggedIn: PropTypes.bool,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
AuthorResultItem.defaultProps = {
  openDetailInNewTab: false,
};

export default AuthorResultItem;
