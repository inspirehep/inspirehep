import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert, Button } from 'antd';
import PropTypes from 'prop-types';

import { isNonBetaRoute } from '../../routes';
import { setBannerVisibility } from '../../../actions/ui';
import ExternalLink from '../../components/ExternalLink';

const BLOG_POST_LINK =
  'https://blog.inspirehep.net/2019/02/introducing-inspire-beta/';

class Banner extends Component {
  constructor(props) {
    super(props);
    this.onBannerAlertClose = this.onBannerAlertClose.bind(this);
  }

  onBannerAlertClose() {
    const { dispatch } = this.props;
    dispatch(setBannerVisibility(false));
  }

  render() {
    const { shouldDisplayBanner, isNonBetaPage } = this.props;
    return (
      shouldDisplayBanner &&
      !isNonBetaPage && (
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
                  href="https://goo.gl/forms/aTYSRzd7vTUhxzL43"
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

Banner.propTypes = {
  isNonBetaPage: PropTypes.bool.isRequired,
  shouldDisplayBanner: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const stateToProps = state => ({
  isNonBetaPage: isNonBetaRoute(String(state.router.location.pathname)),
  shouldDisplayBanner: state.ui.get('bannerVisibility'),
});

const dispatchToProps = dispatch => ({ dispatch });

export default connect(stateToProps, dispatchToProps)(Banner);
