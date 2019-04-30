import React, { Component } from 'react';
import { stringify } from 'qs';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';

import './CitationSummaryTable.scss';
import { Tooltip } from 'antd';
import { LITERATURE } from '../../../common/routes';

class CitationSummaryTable extends Component {
  render() {
    const { citationSummary, searchQuery } = this.props;
    const published = citationSummary.getIn([
      'citations',
      'buckets',
      'published',
    ]);
    const all = citationSummary.getIn(['citations', 'buckets', 'all']);
    const hIndex = citationSummary.getIn(['h-index', 'value']);
    const urlSearchForAllPapers = stringify(
      searchQuery.set('q', 'citeable:true').toJS(),
      {
        indices: false,
      }
    );
    const urlSearchForPublishedPapers = stringify(
      searchQuery.set('q', 'citeable:true and refereed:true').toJS(),
      { indices: false }
    );
    return (
      <div className="__CitationTable__">
        <table>
          <tbody>
            <tr>
              <th>
                <strong className="f5">Citation Summary</strong>
              </th>
              <th>All</th>
              <th>
                <Tooltip title="Published papers are believed to have undergone rigorous peer-review.">
                  Published
                </Tooltip>
              </th>
            </tr>
            <tr>
              <th>Papers</th>
              <td>
                <Link to={`${LITERATURE}?${urlSearchForAllPapers}`}>
                  {all.get('doc_count')}
                </Link>
              </td>
              <td>
                <Link to={`${LITERATURE}?${urlSearchForPublishedPapers}`}>
                  {published.get('doc_count')}
                </Link>
              </td>
            </tr>
            <tr>
              <th>Citations</th>
              <td>{all.getIn(['citations_count', 'value'])}</td>
              <td>{published.getIn(['citations_count', 'value'])}</td>
            </tr>
            <tr>
              <th>h-index</th>
              <td>{hIndex.get('all')}</td>
              <td>{hIndex.get('published')}</td>
            </tr>
            <tr>
              <th>Citations/paper (avg)</th>
              <td>
                {(all.getIn(['average_citations', 'value']) || 0).toFixed(1)}
              </td>
              <td>
                {(published.getIn(['average_citations', 'value']) || 0).toFixed(
                  1
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

CitationSummaryTable.propTypes = {
  citationSummary: PropTypes.instanceOf(Map).isRequired,
  searchQuery: PropTypes.instanceOf(Map).isRequired,
};

export default CitationSummaryTable;
