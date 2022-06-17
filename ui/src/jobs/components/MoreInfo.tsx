import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import URLList from '../../common/components/URLList';
function MoreInfo (props: any){
    const { urls } = props;
    return (
      urls && (
        <div>
          <strong>More Information: </strong>
          {/* @ts-ignore */}
          <URLList urls={urls} wrapperClassName="di" />
        </div>
      )
    );
}

{/* @ts-ignore */}
MoreInfo.propTypes = {
 /* @ts-ignore */
  urls: PropTypes.instanceOf(List),
};

{/* @ts-ignore */}
MoreInfo.defaultProps = {
  urls: null,
};

export default MoreInfo;
