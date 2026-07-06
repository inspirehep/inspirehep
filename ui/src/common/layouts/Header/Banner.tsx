import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Alert, Button } from 'antd';
import { Map } from 'immutable';
import SanitizedHTML from '../../components/SanitizedHTML';

const ALLOWED_ATTRIBUTES_BY_TAG = { a: ['href', 'target', 'rel'] };
const ALLOWED_HTML_TAGS = ['a', 'p', 'em', 'strong'];

export interface BannerProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  closable?: boolean;
  message: string;
  action?: {
    name: string;
    href: string;
  };
  onClose: Function;
  id: string;
  center?: boolean;
  closedBannersById: Map<string, number>;
  currentPathname: string;
  pathnameRegexp?: RegExp;
}

function Banner({
  type = 'info',
  closable = true,
  message,
  action,
  onClose,
  id,
  center = false,
  closedBannersById,
  currentPathname,
  pathnameRegexp,
}: BannerProps) {
  const afterClose = useCallback(() => {
    onClose(id);
  }, [id, onClose]);
  const isClosed = closedBannersById.has(id);
  const shouldDisplayOnCurrentPathname = pathnameRegexp
    ? pathnameRegexp.test(currentPathname)
    : true;

  return !isClosed && shouldDisplayOnCurrentPathname ? (
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
  ) : null;
}

export default Banner;
