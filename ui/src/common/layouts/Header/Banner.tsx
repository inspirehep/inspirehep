import React, { useCallback } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import SanitizedHTML from 'react-sanitized-html';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classNames from 'classnames';
import { Alert, Button } from 'antd';
import { Map } from 'immutable';

const ALLOWED_ATTRIBUTES_BY_TAG = { a: ['href', 'target', 'rel'] };
const ALLOWED_HTML_TAGS = ['a', 'p', 'em', 'strong'];

type OwnProps = {
    id: string;
    message: string;
    center?: boolean;
    type?: 'error' | 'warning' | 'info' | 'success';
    closable?: boolean;
    action?: {
        name: string;
        href: string;
    };
    pathnameRegexp?: $TSFixMe; // TODO: PropTypes.instanceOf(RegExp)
    onClose?: $TSFixMeFunction;
    closedBannersById: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    currentPathname: string;
};

// @ts-expect-error ts-migrate(2565) FIXME: Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type Props = OwnProps & typeof Banner.defaultProps;

function Banner({ type, closable, message, action, onClose, id, center, closedBannersById, currentPathname, pathnameRegexp, }: Props) {
  const afterClose = useCallback(
    () => {
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
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

Banner.defaultProps = {
  type: 'info',
  closable: true,
  center: false,
};

export default Banner;
