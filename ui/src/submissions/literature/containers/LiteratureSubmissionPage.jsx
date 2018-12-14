import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col } from 'antd';

import { submitAuthor } from '../../../actions/submissions';
import LiteratureSubmission from '../components/LiteratureSubmission';
import ExternalLink from '../../../common/components/ExternalLink';
import SelectBox from '../../../common/components/SelectBox';
import DataImporterContainer from './DataImporterContainer';

const DOC_TYPE_OPTIONS = [
  {
    value: 'article',
    display: 'Article/Conference paper',
  },
  {
    value: 'thesis',
    display: 'Thesis',
  },
  {
    value: 'book',
    display: 'Book',
  },
  {
    value: 'bookChapter',
    display: 'Book Chapter',
  },
];

class LiteratureSubmissionPage extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.onDocTypeChange = this.onDocTypeChange.bind(this);
    this.onDataImportSkipClick = this.onDataImportSkipClick.bind(this);

    this.state = {
      docType: DOC_TYPE_OPTIONS[0].value,
      isFormVisible: false,
    };
  }

  async onSubmit(formData) {
    const { dispatch } = this.props;
    // TODO: submitLiterature
    await dispatch(submitAuthor(formData));
  }

  onDocTypeChange(docType) {
    this.setState({ docType });
  }

  onDataImportSkipClick() {
    this.setState({ isFormVisible: true });
  }

  render() {
    const { error } = this.props;
    const { docType, isFormVisible } = this.state;

    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          <Row className="mb3 pa3 bg-white">
            <h3>Suggest content</h3>
            This form allows you to suggest a preprint, an article, a book, a
            conference proceeding or a thesis you would like to see added to
            INSPIRE. We will check your suggestion with our{' '}
            <ExternalLink href="//inspirehep.net/info/hep/collection-policy">
              selection policy
            </ExternalLink>{' '}
            and transfer it to INSPIRE.
          </Row>
          <Row className="mb3 pa3 bg-white">
            <Col>
              <DataImporterContainer onSkipClick={this.onDataImportSkipClick} />
            </Col>
          </Row>
          {isFormVisible && (
            <>
              <Row
                className="mb3 pa3 bg-white"
                type="flex"
                justify="end"
                align="middle"
              >
                <Col className="pr2">Select type of the document:</Col>
                <Col span={19}>
                  <SelectBox
                    className="w-100"
                    value={docType}
                    options={DOC_TYPE_OPTIONS}
                    onChange={this.onDocTypeChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <LiteratureSubmission
                    error={error}
                    onSubmit={this.onSubmit}
                    docType={docType}
                  />
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    );
  }
}

LiteratureSubmissionPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map), // eslint-disable-line react/require-default-props
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(LiteratureSubmissionPage);
