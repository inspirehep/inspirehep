import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classNames from 'classnames';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import Image from 'react-image';
import { Spin } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';

import './Figure.scss';
import Latex from '../../../common/components/Latex';

const ICON_STYLE = { margin: 'auto', display: 'block', padding: '2rem 0' };
const LOADER = <Spin style={ICON_STYLE} />;
const UNLOADER = <FileImageOutlined className="f2" style={ICON_STYLE} />;

type Props = {
    url: string;
    className?: string;
    onClick?: $TSFixMeFunction;
    caption?: string;
};

function Figure({ url, className, onClick, caption }: Props) {
  return (
    <div className="__Figure__ bg-white pa3">
      <figure className="mv1">
        <Image
          onClick={onClick}
          className={classNames(className, 'ba pa1 db center w-auto h-auto', {
            pointer: onClick,
          })}
          src={url}
          alt="Figure"
          loader={LOADER}
          unloader={UNLOADER}
        />
        {caption && (
          <figcaption className="mt3">
            {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
            <Latex>{caption}</Latex>
          </figcaption>
        )}
      </figure>
    </div>
  );
}

export default Figure;
