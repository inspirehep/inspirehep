/* eslint-disable camelcase */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { List, Row, Col, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { EditOutlined } from '@ant-design/icons';

import AuthorsAndCollaborations from '../../common/components/AuthorsAndCollaborations';
import ArxivEprintList from './ArxivEprintList';
import PublicationInfoList from '../../common/components/PublicationInfoList';
import DOIList from './DOIList';
import { LITERATURE } from '../../common/routes';
import LiteratureTitle from '../../common/components/LiteratureTitle';
import URLList from '../../common/components/URLList';
import {
  InlineUL,
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import IconText from '../../common/components/IconText';
import LinkLikeButton from '../../common/components/LinkLikeButton/LinkLikeButton';
import { getConfigFor } from '../../common/config';

class ReferenceItem extends Component {
  static renderLabel(reference) {
    const label = reference.get('label');
    const labelDisplay = label ? <span>[{label}]</span> : null;
    return labelDisplay;
  }

  static renderTitle(reference, unlinked) {
    const recordId = reference.get('control_number');
    const title = reference.getIn(['titles', 0]);
    if (recordId && title && !unlinked) {
      return (
        <div data-test-id="reference-title">
          <Link
            className={classNames('f5', unlinked ? 'unlinked' : '')}
            to={`${LITERATURE}/${recordId}`}
          >
            <LiteratureTitle title={title} />
          </Link>
        </div>
      );
    }

    if (title) {
      return (
        <div
          className={classNames('f5', unlinked ? 'unlinked' : '')}
          data-test-id="reference-title"
        >
          <LiteratureTitle title={title} unlinked={unlinked} />
        </div>
      );
    }

    return null;
  }

  static renderMisc(reference) {
    const misc = reference.get('misc');
    return misc && <div>{misc}</div>;
  }

  render() {
    const {
      reference,
      unlinked,
      onEditReferenceClick,
      disableEdit,
      loggedIn,
      reference_index,
      setScrollElement,
    } = this.props;
    const publicationInfo = reference.get('publication_info');
    const arxivEprint = reference.get('arxiv_eprint');
    const dois = reference.get('dois');
    const urls = reference.get('urls');
    const recordId = reference.get('control_number');

    const authors = reference.get('authors');
    const collaborations = reference.get('collaborations');
    const collaborationsWithSuffix = reference.get(
      'collaborations_with_suffix'
    );

    const enableEdit = getConfigFor('SELF_CURATION_BUTTON') && !disableEdit;

    return (
      <div
        data-test-id="reference-item"
        id={reference_index && `reference-${reference_index}`}
      >
        <List.Item>
          <Row
            gutter={24}
            type="flex"
            justify="start"
            align="middle"
            className="w-100 flex-nowrap"
          >
            <Col xs={2} lg={1}>
              <div className="flex">{ReferenceItem.renderLabel(reference)}</div>
            </Col>
            <Col style={{ width: '100%' }}>
              <List.Item.Meta
                title={ReferenceItem.renderTitle(reference, unlinked)}
                description={
                  <Fragment>
                    {ReferenceItem.renderMisc(reference)}
                    <AuthorsAndCollaborations
                      authors={authors}
                      collaborations={collaborations}
                      collaborationsWithSuffix={collaborationsWithSuffix}
                      page="Literature detail"
                      unlinked={unlinked}
                    />
                    <InlineUL
                      separator={SEPARATOR_MIDDLEDOT}
                      wrapperClassName="secondary-container"
                    >
                      {publicationInfo && (
                        <PublicationInfoList
                          publicationInfo={publicationInfo}
                          labeled={false}
                        />
                      )}
                      {arxivEprint && (
                        <ArxivEprintList
                          page="Literature detail"
                          eprints={arxivEprint}
                        />
                      )}
                      {dois && <DOIList dois={dois} />}
                      {urls && !recordId && <URLList urls={urls} />}
                    </InlineUL>
                  </Fragment>
                }
              />
            </Col>
            {enableEdit && (
              <Col span={2} className="pr3">
                <Tooltip
                  title={loggedIn ? 'Edit this reference' : 'Log in to edit'}
                >
                  <div
                    className="flex items-center justify-center"
                    data-test-id="edit-reference"
                  >
                    <LinkLikeButton
                      onClick={() => {
                        setScrollElement(`reference-${reference_index}`);
                        onEditReferenceClick(reference_index);
                      }}
                      disabled={!loggedIn}
                    >
                      <IconText
                        text="edit"
                        icon={<EditOutlined />}
                        className="flex items-center justify-center pr2"
                      />
                    </LinkLikeButton>
                  </div>
                </Tooltip>
              </Col>
            )}
          </Row>
        </List.Item>
      </div>
    );
  }
}

ReferenceItem.propTypes = {
  reference: PropTypes.instanceOf(Map).isRequired,
};

export default ReferenceItem;
