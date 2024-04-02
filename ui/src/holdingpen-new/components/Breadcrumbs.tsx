import React from 'react';
import { Breadcrumb, Input } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import './Breadcrumbs.less';

interface BreadcrumbItemProps {
  title1: string;
  href1: string;
  title2?: string;
  href2?: string;
  dashboardPage?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbItemProps> = ({
  title1,
  href1,
  title2,
  href2,
  dashboardPage = false,
}) => {
  const { Search } = Input;

  return (
    <div className="flex items-center justify-between">
      <Breadcrumb separator="|" className="mv4">
        <Breadcrumb.Item>
          <a href="/">
            <HomeOutlined className="mr2" /> Inspirehep
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="/holdingpen-new">Holdingpen</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href={`/holdingpen-new/${title2 ? 'search' : href1}`}>{title1}</a>
        </Breadcrumb.Item>
        {title2 && (
          <Breadcrumb.Item>
            <a href={`/holdingpen-new/${href2}`}>{title2}</a>
          </Breadcrumb.Item>
        )}
      </Breadcrumb>
      {!dashboardPage && (
        <Search
          enterButton
          placeholder="Search Holdingpen"
          onPressEnter={() => {
            window.location.assign('/holdingpen-new/search');
          }}
          onSearch={() => {
            window.location.assign('/holdingpen-new/search');
          }}
          className="search-bar-small"
        />
      )}
    </div>
  );
};

export default Breadcrumbs;
