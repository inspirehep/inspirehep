import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';

import './CitationSummaryTable.scss';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../ExternalLink.tsx';
import LabelWithHelp from '../LabelWithHelp';
import LoadingOrChildren from '../LoadingOrChildren';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';
import { ErrorPropType } from '../../propTypes';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import FormattedNumber from '../FormattedNumber.tsx';
import { PUBLISHED_URL } from '../../constants';

const PUBLISHED_HELP_MESSAGE = (
  <span>
    Published papers are believed to have undergone rigorous peer review.{' '}
    <ExternalLink href={PUBLISHED_URL}>Learn More</ExternalLink>
  </span>
);

const H_INDEX_HELP_MESSAGE = (
  <span>
    The h-index is defined as the number of papers with citation number higher
    or equal to h. <Link to="/literature/690567">Learn more</Link>
  </span>
);

function toFixedNumber(numberOrNull: any) {
  return numberOrNull == null ? 0 : numberOrNull.toFixed(1);
}

class CitationSummaryTable extends Component {
  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'publishedBucket' does not exist on type ... Remove this comment to see the full error message
      publishedBucket,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'citeableBucket' does not exist on type '... Remove this comment to see the full error message
      citeableBucket,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'hIndex' does not exist on type 'Readonly... Remove this comment to see the full error message
      hIndex,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'loading' does not exist on type 'Readonl... Remove this comment to see the full error message
      loading,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type 'Readonly<... Remove this comment to see the full error message
      error,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'renderNumberOfCiteablePapers' does not e... Remove this comment to see the full error message
      renderNumberOfCiteablePapers,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'renderNumberOfPublishedPapers' does not ... Remove this comment to see the full error message
      renderNumberOfPublishedPapers,
    } = this.props;

    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <LoadingOrChildren loading={loading}>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <ErrorAlertOrChildren error={error}>
          <div className="__CitationTable__">
            <table>
              <tbody>
                <tr>
                  <th />
                  <th>
                    <LabelWithHelp
                      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                      label="Citeable"
                      help="Citeable papers have metadata that allow us to reliably track their citations."
                    />
                  </th>
                  <th>
                    <LabelWithHelp
                      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                      label="Published"
                      help={PUBLISHED_HELP_MESSAGE}
                    />
                  </th>
                </tr>
                <tr>
                  <th>Papers</th>
                  <td>
                    {renderNumberOfCiteablePapers(
                      citeableBucket.get('doc_count', 0)
                    )}
                  </td>
                  <td>
                    {renderNumberOfPublishedPapers(
                      publishedBucket.get('doc_count', 0)
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Citations</th>
                  <td>
                    <FormattedNumber>
                      {citeableBucket.getIn(['citations_count', 'value'], 0)}
                    </FormattedNumber>
                  </td>
                  <td>
                    <FormattedNumber>
                      {publishedBucket.getIn(['citations_count', 'value'], 0)}
                    </FormattedNumber>
                  </td>
                </tr>
                <tr>
                  <th>
                    <LabelWithHelp
                      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                      label="h-index"
                      help={H_INDEX_HELP_MESSAGE}
                    />
                  </th>
                  <td>
                    <FormattedNumber>{hIndex.get('all', 0)}</FormattedNumber>
                  </td>
                  <td>
                    <FormattedNumber>
                      {hIndex.get('published', 0)}
                    </FormattedNumber>
                  </td>
                </tr>
                <tr>
                  <th>Citations/paper (avg)</th>
                  <td>
                    <FormattedNumber>
                      {toFixedNumber(
                        citeableBucket.getIn(['average_citations', 'value'], 0)
                      )}
                    </FormattedNumber>
                  </td>
                  <td>
                    <FormattedNumber>
                      {toFixedNumber(
                        publishedBucket.getIn(['average_citations', 'value'], 0)
                      )}
                    </FormattedNumber>
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
CitationSummaryTable.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  publishedBucket: PropTypes.instanceOf(Map),
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  citeableBucket: PropTypes.instanceOf(Map),
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  hIndex: PropTypes.instanceOf(Map),
  renderNumberOfCiteablePapers: PropTypes.func,
  renderNumberOfPublishedPapers: PropTypes.func,
  loading: PropTypes.bool.isRequired,
  error: ErrorPropType,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
CitationSummaryTable.defaultProps = {
  publishedBucket: Map(),
  citeableBucket: Map(),
  hIndex: Map(),
  renderNumberOfCiteablePapers: (value: any) => <FormattedNumber>{value}</FormattedNumber>,
  renderNumberOfPublishedPapers: (value: any) => <FormattedNumber>{value}</FormattedNumber>,
};

export default CitationSummaryTable;
