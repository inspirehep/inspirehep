import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'antd';
import IconText from '../../common/components/IconText';
import ListItemAction from '../../common/components/ListItemAction';
import EventTracker from '../../common/components/EventTracker';

class DOILinkAction extends Component {
  render() {
    const { doi } = this.props;
    const href = `//doi.org/${doi}`;
    return (
      <ListItemAction>
        <EventTracker eventId="DoiLink">
          <Button href={href} target="_blank">
            <IconText text="DOI" type="link" />
          </Button>
        </EventTracker>
      </ListItemAction>
    );
  }
}

DOILinkAction.propTypes = {
  doi: PropTypes.string.isRequired,
};

export default DOILinkAction;
