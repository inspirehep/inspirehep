import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { LoginOutlined } from '@ant-design/icons';

import { Row, Col } from 'antd';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import EditRecordAction from '../../common/components/EditRecordAction.tsx';
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'metadata' does not exist on type 'Readon... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
            // @ts-expect-error ts-migrate(2786) FIXME: 'ConferenceDates' cannot be used as a JSX componen... Remove this comment to see the full error message
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
              // @ts-expect-error ts-migrate(2322) FIXME: Type '{ categories: any; wrapperClassName: string;... Remove this comment to see the full error message
              wrapperClassName="di"
            />
          </Col>
        </Row>
      </ResultItem>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ConferenceItem.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  metadata: PropTypes.instanceOf(Map).isRequired,
  openDetailInNewTab: PropTypes.bool,
};

export default ConferenceItem;
