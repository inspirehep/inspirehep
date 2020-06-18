import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { LoginOutlined } from '@ant-design/icons';

import { Row, Col } from 'antd';
import EditRecordAction from '../../common/components/EditRecordAction';
import ResultItem from '../../common/components/ResultItem';
import { CONFERENCES, LITERATURE } from '../../common/routes';
import ConferenceDates from './ConferenceDates';
import AddressList from '../../common/components/AddressList';
import InspireCategoryList from './InspireCategoryList';
import ProceedingsAction from './ProceedingsAction';
import pluralizeUnlessSingle from '../../common/utils';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';
import { getContributionsQueryString } from '../utils';
import EventTitle from '../../common/components/EventTitle';
import UrlsAction from '../../literature/components/UrlsAction';

class ConferenceItem extends Component {
  render() {
    const { metadata, openDetailInNewTab } = this.props;

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
            {urls && <UrlsAction urls={urls} />}
            {proceedings && <ProceedingsAction proceedings={proceedings} />}
            {canEdit && (
              <EditRecordAction pidType="conferences" pidValue={recordId} />
            )}
          </>
        }
        rightActions={
          contributionsCount !== 0 && (
            <ListItemAction>
              <Link
                to={`${LITERATURE}?q=${getContributionsQueryString(
                  recordId
                )}&doc_type=conference%20paper`}
              >
                <IconText
                  text={`${contributionsCount} ${pluralizeUnlessSingle(
                    'contribution',
                    contributionsCount
                  )}`}
                  icon={<LoginOutlined />}
                />
              </Link>
            </ListItemAction>
          )
        }
      >
        <Row type="flex">
          <Col>
            <Link
              className="result-item-title"
              to={`${CONFERENCES}/${recordId}`}
              target={openDetailInNewTab ? '_blank' : null}
            >
              <EventTitle title={title} acronym={acronym} />
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
