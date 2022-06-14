import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import SanitizedHTML from 'react-sanitized-html';
import classNames from 'classnames';
import { Alert, Button } from 'antd';
import { Map } from 'immutable';

const ALLOWED_ATTRIBUTES_BY_TAG = { a: ['href', 'target', 'rel'] };
const ALLOWED_HTML_TAGS = ['a', 'p', 'em', 'strong'];

function Banner({
  type,
  closable,
  message,
  action,
  onClose,
  id,
  center,
  closedBannersById,
  currentPathname,
  pathnameRegexp,
}) {
  const afterClose = useCallback(
    () => {
      onClose(id);
    },
    [id, onClose]
  );
  const isClosed = closedBannersById.has(id);
  const shouldDisplayOnCurrentPathname = pathnameRegexp
    ? pathnameRegexp.test(currentPathname)
    : true;
  return (
    !isClosed &&
    shouldDisplayOnCurrentPathname && (
      <Alert
        type={type}
        banner
        className={classNames({ tc: center })}
        closable={closable}
        afterClose={afterClose}
        showIcon={false}
        message={
          <span>
            <SanitizedHTML
              className={classNames('di', { mr3: Boolean(action) })}
              allowedAttributes={ALLOWED_ATTRIBUTES_BY_TAG}
              allowedTags={ALLOWED_HTML_TAGS}
              html={message}
            />
            {action && (
              <Button type="primary" target="_blank" href={action.href}>
                {action.name}
              </Button>
            )}
          </span>
        }
      />
    )
  );
}

Banner.propTypes = {
  // via BANNERS config
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired, // can have limited html tags
  center: PropTypes.bool,
  type: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  closable: PropTypes.bool,
  action: PropTypes.shape({
    name: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
  }),
  pathnameRegexp: PropTypes.instanceOf(RegExp),

  // from container props
  onClose: PropTypes.func,
  closedBannersById: PropTypes.instanceOf(Map).isRequired,
  currentPathname: PropTypes.string.isRequired,
};

Banner.defaultProps = {
  type: 'info',
  closable: true,
  center: false,
};

export default Banner;
