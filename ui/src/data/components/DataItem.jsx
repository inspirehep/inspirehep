/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';

import { FileOutlined } from '@ant-design/icons';
import UrlsAction from '../../literature/components/UrlsAction';
import DOILinkAction from '../../literature/components/DOILinkAction';
import ResultItem from '../../common/components/ResultItem';

import {
  filterDoisByMaterial,
  getReferencingPapersQueryString,
  transformLiteratureRecords,
} from '../utils';
import { DATA } from '../../common/routes';
import LiteratureTitle from '../../common/components/LiteratureTitle';
import AuthorsAndCollaborations from '../../common/components/AuthorsAndCollaborations';
import IncomingLiteratureReferencesLinkAction from '../../common/components/IncomingLiteratureReferencesLinkAction';

function DataItem({ metadata, page }) {
  const title = metadata.getIn(['titles', 0]);
  const authors = metadata.get('authors');
  const authorCount = (authors && authors.size) || 0;
  const dois = filterDoisByMaterial(metadata.get('dois', List()));
  const recordId = metadata.get('control_number');
  const urls = metadata.get('urls');
  const collaborations = metadata.get('collaborations', List());
  const citationCount = metadata.get('citation_count');
  const literatureRecords = metadata.get('literature');
  const literatureLinks = transformLiteratureRecords(literatureRecords);

  return (
    <div data-test-id="data-result-item">
      <ResultItem
        leftActions={
          <>
            {urls && (
              <UrlsAction
                urls={urls}
                text="links"
                trackerEventId="Literature file"
                page={page}
              />
            )}
            {dois.size > 0 && <DOILinkAction dois={dois} page={page} />}
            {literatureLinks && (
              <UrlsAction
                urls={literatureLinks}
                icon={<FileOutlined />}
                text="literature"
                trackerEventId="Literature links"
                page="Literature detail"
                isTargetBlank={false}
              />
            )}
          </>
        }
        rightActions={
          citationCount !== null && citationCount !== undefined ? (
            <IncomingLiteratureReferencesLinkAction
              itemCount={citationCount}
              referenceType="citation"
              linkQuery={getReferencingPapersQueryString(recordId)}
              trackerEventId="Citations link"
              eventCategory="Data search"
            />
          ) : (
            <></>
          )
        }
      >
        <div data-test-id="data-result-item-inner">
          <div className="flex flex-nowrap">
            <div className="flex-grow-1">
              <Link
                data-test-id="data-result-title-link"
                className="result-item-title"
                to={`${DATA}/${recordId}`}
              >
                <LiteratureTitle title={title} />
              </Link>
            </div>
          </div>
          <div className="mt1">
            <AuthorsAndCollaborations
              authorCount={authorCount}
              authors={authors}
              collaborations={collaborations}
            />
          </div>
        </div>
      </ResultItem>
    </div>
  );
}

DataItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
  isCatalogerLoggedIn: PropTypes.bool,
};

export default DataItem;
