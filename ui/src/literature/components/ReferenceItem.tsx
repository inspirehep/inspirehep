import React, { Component, Fragment } from 'react';
import { Map } from 'immutable';
import { List, Row, Col } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

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

type Props = {
    reference: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

class ReferenceItem extends Component<Props> {

  static renderLabel(reference: $TSFixMe) {
    const label = reference.get('label');
    const labelDisplay = label ? <span>[{label}]</span> : null;
    return labelDisplay;
  }

  static renderTitle(reference: $TSFixMe) {
    const recordId = reference.get('control_number');
    const title = reference.getIn(['titles', 0]);
    if (recordId && title) {
      return (
        <Link className="f5" to={`${LITERATURE}/${recordId}`}>
          <LiteratureTitle title={title} />
        </Link>
      );
    }

    if (title) {
      return (
        <div className="f5">
          <LiteratureTitle title={title} />
        </div>
      );
    }

    return null;
  }

  static renderMisc(reference: $TSFixMe) {
    const misc = reference.get('misc');
    return misc && <div>{misc}</div>;
  }

  render() {
    const { reference } = this.props;
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

    return (
      <List.Item>
        <Row
          gutter={24}
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          type="flex"
          justify="start"
          align="middle"
          className="w-100 sm-plus-flex-nowrap"
        >
          <Col className="xs-sm-col-24">
            {ReferenceItem.renderLabel(reference)}
          </Col>
          <Col>
            <List.Item.Meta
              title={ReferenceItem.renderTitle(reference)}
              description={
                <Fragment>
                  {ReferenceItem.renderMisc(reference)}
                  <AuthorsAndCollaborations
                    authors={authors}
                    collaborations={collaborations}
                    collaborationsWithSuffix={collaborationsWithSuffix}
                  />
                  {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
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
                    {arxivEprint && <ArxivEprintList eprints={arxivEprint} />}
                    {dois && <DOIList dois={dois} />}
                    {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
                    {urls && !recordId && <URLList urls={urls} />}
                  </InlineUL>
                </Fragment>
              }
            />
          </Col>
        </Row>
      </List.Item>
    );
  }
}

export default ReferenceItem;
