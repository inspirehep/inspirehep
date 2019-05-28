import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import './CitationSummaryTable.scss';
import ExternalLink from '../ExternalLink';
import LabelWithHelp from '../LabelWithHelp';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';
import { ErrorPropType } from '../../propTypes';

const CITABLE_HELP_MESSAGE = (
  <span>
    Published papers are believed to have undergone rigorous peer-review.&nbsp;
    <ExternalLink href="http://inspirehep.net/info/faq/general#published">
      Learn More
    </ExternalLink>
  </span>
);

class CitationSummaryTable extends Component {
  render() {
    const {
      publishedBucket,
      citeableBucket,
      hIndex,
      loading,
      error,
      renderNumberOfCiteablePapers,
      renderNumberOfPublishedPapers,
    } = this.props;

    return (
      <LoadingOrChildren loading={loading}>
        <ErrorAlertOrChildren error={error}>
          <div className="__CitationTable__">
            <table>
              <tbody>
                <tr>
                  <th />
                  <th>
                    <LabelWithHelp
                      label="Citeable"
                      help="Citeable papers have metadata that allow us to reliably track their citations."
                    />
                  </th>
                  <th>
                    <LabelWithHelp
                      label="Published"
                      help={CITABLE_HELP_MESSAGE}
                    />
                  </th>
                </tr>
                <tr>
                  <th>Papers</th>
                  <td>
                    {!citeableBucket.get('doc_count')
                      ? '0'
                      : renderNumberOfCiteablePapers(
                          citeableBucket.get('doc_count')
                        )}
                  </td>
                  <td>
                    {!publishedBucket.get('doc_count')
                      ? '0'
                      : renderNumberOfPublishedPapers(
                          publishedBucket.get('doc_count')
                        )}
                  </td>
                </tr>
                <tr>
                  <th>Citations</th>
                  <td>{citeableBucket.getIn(['citations_count', 'value'])}</td>
                  <td>{publishedBucket.getIn(['citations_count', 'value'])}</td>
                </tr>
                <tr>
                  <th>h-index</th>
                  <td>{hIndex.get('all')}</td>
                  <td>{hIndex.get('published')}</td>
                </tr>
                <tr>
                  <th>Citations/paper (avg)</th>
                  <td>
                    {(
                      citeableBucket.getIn(['average_citations', 'value']) || 0
                    ).toFixed(1)}
                  </td>
                  <td>
                    {(
                      publishedBucket.getIn(['average_citations', 'value']) || 0
                    ).toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ErrorAlertOrChildren>
      </LoadingOrChildren>
    );
  }
}

CitationSummaryTable.propTypes = {
  publishedBucket: PropTypes.instanceOf(Map),
  citeableBucket: PropTypes.instanceOf(Map),
  hIndex: PropTypes.instanceOf(Map),
  renderNumberOfCiteablePapers: PropTypes.func,
  renderNumberOfPublishedPapers: PropTypes.func,
  loading: PropTypes.bool.isRequired,
  error: ErrorPropType, // eslint-disable-line react/require-default-props
};

CitationSummaryTable.defaultProps = {
  publishedBucket: Map(),
  citeableBucket: Map(),
  hIndex: Map(),
  renderNumberOfCiteablePapers: value => value,
  renderNumberOfPublishedPapers: value => value,
};

export default CitationSummaryTable;
