import React from 'react';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';

import { Row, Col } from 'antd';
import EditRecordAction from '../../common/components/EditRecordAction';
import ResultItem from '../../common/components/ResultItem';
import { CONFERENCES } from '../../common/routes';
import ConferenceDates from './ConferenceDates';
import AddressList from '../../common/components/AddressList';
import InspireCategoryList from './InspireCategoryList';
import ProceedingsAction from './ProceedingsAction';
import EventTitle from '../../common/components/EventTitle';
import UrlsAction from '../../literature/components/UrlsAction';
import ConferenceContributionLink from './ConferenceContributionLink';

const ConferenceItem = ({
  metadata,
  openDetailInNewTab,
}: {
  metadata: Map<string, any>;
  openDetailInNewTab: boolean;
}) => {
  const title = metadata.getIn(['titles', 0]);
  const acronym = metadata.getIn(['acronyms', 0]);
  const openingDate = metadata.get('opening_date');
  const closingDate = metadata.get('closing_date');
  const addresses = metadata.get('addresses');
  const cnum = metadata.get('cnum');
  const recordId = metadata.get('control_number');
  const canEdit = metadata.get('can_edit', false);
  const inspireCategories = metadata.get('inspire_categories');
  const urls = metadata.get('urls');
  const proceedings = metadata.get('proceedings');
  const contributionsCount = metadata.get('number_of_contributions', 0);

  return (
    <ResultItem
      leftActions={
        <>
          {urls && (
            <UrlsAction
              urls={urls}
              page="Conferences search"
              trackerEventId="Conferences website"
            />
          )}
          {proceedings && <ProceedingsAction proceedings={proceedings} />}
          {canEdit && (
            <EditRecordAction
              pidType="conferences"
              pidValue={recordId}
              page="Conferences search"
            />
          )}
        </>
      }
      rightActions={
        contributionsCount !== 0 && (
          <ConferenceContributionLink
            recordId={recordId}
            contributionsCount={contributionsCount}
          />
        )
      }
    >
      <Row>
        <Col>
          <Link
            className="result-item-title"
            to={`${CONFERENCES}/${recordId}`}
            target={openDetailInNewTab ? '_blank' : undefined}
          >
            <EventTitle title={title} acronym={acronym as string} />
          </Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <ConferenceDates
            openingDate={openingDate}
            closingDate={closingDate}
          />
          {addresses && (
            <>
              {'. '}
              <AddressList addresses={addresses} />
            </>
          )}
          {cnum && ` (${cnum})`}
        </Col>
      </Row>
      <Row className="mt2">
        <Col>
          <InspireCategoryList categories={inspireCategories} />
        </Col>
      </Row>
    </ResultItem>
  );
};

export default ConferenceItem;
