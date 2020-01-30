import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import { Row, Col } from 'antd';
import EditRecordAction from '../../common/components/EditRecordAction';
import ResultItem from '../../common/components/ResultItem';
import { CONFERENCES } from '../../common/routes';
import ConferenceTitle from './ConferenceTitle';
import ConferenceDates from './ConferenceDates';
import ConferenceLocation from './ConferenceLocation';
import InspireCategoryList from './InspireCategoryList';
import ConferenceWebsitesAction from './ConferenceWebsitesAction';
import ProceedingsAction from './ProceedingsAction';
import pluralizeUnlessSingle from '../../common/utils';

class ConferenceItem extends Component {
  render() {
    const { metadata, openDetailInNewTab } = this.props;

    const title = metadata.getIn(['titles', 0]);
    const acronym = metadata.getIn(['acronyms', 0]);
    const openingDate = metadata.get('opening_date');
    const closingDate = metadata.get('closing_date');
    const location = metadata.getIn(['addresses', 0]);
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
            {urls && <ConferenceWebsitesAction websites={urls} />}
            {proceedings && <ProceedingsAction proceedings={proceedings} />}
            {canEdit && (
              <EditRecordAction pidType="conferences" pidValue={recordId} />
            )}
          </>
        }
      >
        <Row type="flex">
          <Col>
            <Link
              className="f5"
              to={`${CONFERENCES}/${recordId}`}
              target={openDetailInNewTab ? '_blank' : null}
            >
              <ConferenceTitle title={title} acronym={acronym} />
            </Link>
          </Col>
        </Row>
        <Row>
          <Col>
            <ConferenceDates
              openingDate={openingDate}
              closingDate={closingDate}
            />
            {location && (
              <>
                {'. '}
                <ConferenceLocation location={location} />
              </>
            )}
            {cnum && ` (${cnum})`}
          </Col>
        </Row>
        {contributionsCount !== 0 && (
          <Row className="mt2">
            <Col>
              {`${contributionsCount} ${pluralizeUnlessSingle(
                'contribution',
                contributionsCount
              )}`}
            </Col>
          </Row>
        )}
        <Row className="mt2">
          <Col>
            <InspireCategoryList
              categories={inspireCategories}
              wrapperClassName="di"
            />
          </Col>
        </Row>
      </ResultItem>
    );
  }
}

ConferenceItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
  openDetailInNewTab: PropTypes.bool,
};

export default ConferenceItem;
