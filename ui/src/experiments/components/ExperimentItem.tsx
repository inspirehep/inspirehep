import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Map, List } from 'immutable';
import { Row, Col } from 'antd';

import ResultItem from '../../common/components/ResultItem';
import IncomingLiteratureReferencesLinkAction from '../../common/components/IncomingLiteratureReferencesLinkAction';
import { EXPERIMENTS } from '../../common/routes';
import AffiliationList from '../../common/components/AffiliationList';
import { SEPARATOR_MIDDLEDOT } from '../../common/components/InlineList';
import ExperimentCollaboration from './ExperimentCollaboration';
import UrlsAction from '../../literature/components/UrlsAction';
import { getPapersQueryString } from '../utils';

function ExperimentItem({ metadata }) {
  const legacyName = metadata.get('legacy_name');
  const recordId = metadata.get('control_number');
  const institutions = metadata.get('institutions', List());
  const longName = metadata.get('long_name');
  const collaboration = metadata.get('collaboration');
  const urls = metadata.get('urls');
  const papersCount = metadata.get('number_of_papers', 0);

  return (
    <ResultItem
      leftActions={
        <>
          {urls && (
            <UrlsAction
              urls={urls}
              text="links"
              trackerEventId="Experiments:Url"
            />
          )}
        </>
      }
      rightActions={
        <IncomingLiteratureReferencesLinkAction
          itemCount={papersCount}
          referenceType="paper"
          linkQuery={getPapersQueryString(recordId)}
          trackerEventId="Experiments:PapersLink"
        />
      }
    >
      <Row>
        <Col>
          <Link className="result-item-title" to={`${EXPERIMENTS}/${recordId}`}>
            {legacyName}
          </Link>
          {institutions.size > 0 && (
            <span className="pl1">
              (
              <AffiliationList
                affiliations={institutions}
                separator={SEPARATOR_MIDDLEDOT}
              />
              )
            </span>
          )}
        </Col>
      </Row>
      {longName && (
        <Row>
          <Col>{longName}</Col>
        </Row>
      )}
      {collaboration && (
        <Row>
          <Col>
            <ExperimentCollaboration collaboration={collaboration} />
          </Col>
        </Row>
      )}
    </ResultItem>
  );
}

ExperimentItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
};

export default ExperimentItem;
