import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert, Button } from 'antd';
import PropTypes from 'prop-types';

import { setBannerVisibility } from '../../../actions/ui';
import ExternalLink from '../../components/ExternalLink';
import { SURVEY_LINK } from '../../constants';

const BLOG_POST_LINK =
  'https://blog.inspirehep.net/2019/02/introducing-inspire-beta/';

class BetaInfoBanner extends Component {
  constructor(props) {
    super(props);
    this.onBannerAlertClose = this.onBannerAlertClose.bind(this);
  }

  onBannerAlertClose() {
    const { dispatch } = this.props;
    dispatch(setBannerVisibility(false));
  }

  render() {
    const { shouldDisplayBanner } = this.props;
    return (
      shouldDisplayBanner && (
        <div className="banner">
          <Alert
            type="info"
            banner
            closable
            afterClose={this.onBannerAlertClose}
            showIcon={false}
            message={
              <span>
                <strong>
                  INSPIRE beta provides a preview of new features currently
                  under development. For more info, visit our{' '}
                  <ExternalLink href={BLOG_POST_LINK}>blog</ExternalLink>. Try
                  it out and let us know what you think!
                </strong>
                <Button
                  className="ml3"
                  type="primary"
                  target="_blank"
                  href={SURVEY_LINK}
                >
                  Take the survey
                </Button>
              </span>
            }
          />
        </div>
      )
    );
  }
}

BetaInfoBanner.propTypes = {
  shouldDisplayBanner: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const stateToProps = state => ({
  shouldDisplayBanner: state.ui.get('bannerVisibility'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(BetaInfoBanner);
