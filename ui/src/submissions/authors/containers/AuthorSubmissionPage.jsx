import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Row, Col } from 'antd';

import { submitAuthor } from '../../../actions/submissions';
import AuthorSubmission from '../components/AuthorSubmission';
import ExternalLink from '../../../common/components/ExternalLink';

class AuthorSubmissionPage extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(formData) {
    const { dispatch } = this.props;
    await dispatch(submitAuthor(formData));
  }

  render() {
    const { error } = this.props;
    return (
      <Row type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          <Row className="mb3 pa3 bg-white">
            <h3>Suggest author</h3>
            This form allows you to add new author information. All
            modifications are transferred to{' '}
            <ExternalLink href="//inspirehep.net/hepnames">
              inspirehep.net/hepnames
            </ExternalLink>{' '}
            upon approval.
          </Row>
          <Row>
            <Col>
              <AuthorSubmission error={error} onSubmit={this.onSubmit} />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

AuthorSubmissionPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Map), // eslint-disable-line react/require-default-props
};

const stateToProps = state => ({
  error: state.submissions.get('submitError'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(AuthorSubmissionPage);
