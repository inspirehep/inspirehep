import React, { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Tooltip, Button } from 'antd';

import {
  SUBMISSIONS_AUTHOR,
  USER_LOGIN,
  SUBMISSIONS_JOB,
  SUBMISSIONS_LITERATURE,
  SUBMISSIONS_CONFERENCE,
  SUBMISSIONS_SEMINAR,
  SUBMISSIONS_INSTITUTION,
  SUBMISSIONS_EXPERIMENT,
  SUBMISSIONS_JOURNAL,
  USER_SETTINGS,
} from '../../routes';
import LinkWithTargetBlank from '../../components/LinkWithTargetBlank';
import LinkLikeButton from '../../components/LinkLikeButton/LinkLikeButton';

import './HeaderMenu.less';
import { PAPER_SEARCH_URL, HELP_BLOG_URL } from '../../constants';
import DisplayGuideButtonContainer from '../../containers/DisplayGuideButtonContainer';
import { CLAIMING_DISABLED_INFO } from '../../../authors/components/AssignNoProfileAction';

interface MenuItem {
  key: string;
  label?: string | JSX.Element | JSX.Element[];
  popupClassName?: string;
  children?: any;
}

const HeaderMenu = ({
  loggedIn,
  loggedInToHoldingpen,
  onLogoutClick,
  isCatalogerLoggedIn,
  profileControlNumber,
  onLogout,
}: {
  loggedIn: boolean;
  onLogoutClick: MouseEventHandler<HTMLElement>;
  isCatalogerLoggedIn?: boolean;
  profileControlNumber?: string;
  onLogout: any;
  loggedInToHoldingpen: boolean;
}) => {
  const USER_PROFILE_URL = `/authors/${profileControlNumber}`;

  let submitItems = [
    {
      key: 'submit.literature',
      label: [
        <span key="submit.literature">
          <Link to={SUBMISSIONS_LITERATURE}>Literature</Link>
        </span>,
      ],
    },
    {
      key: 'submit.author',
      label: [
        <span key="submit.author">
          <Link to={SUBMISSIONS_AUTHOR}>Author</Link>
        </span>,
      ],
    },
    {
      key: 'submit.job',
      label: [
        <span key="submit.job">
          <Link to={SUBMISSIONS_JOB}>Job</Link>
        </span>,
      ],
    },
    {
      key: 'submit.seminar',
      label: [
        <span key="submit.seminar">
          <Link to={SUBMISSIONS_SEMINAR}>Seminar</Link>
        </span>,
      ],
    },
    {
      key: 'submit.conference',
      label: [
        <span key="submit.conference">
          <Link to={SUBMISSIONS_CONFERENCE}>Conference</Link>
        </span>,
      ],
    },
  ];

  if (isCatalogerLoggedIn) {
    submitItems = [
      ...submitItems,
      {
        key: 'submit.institution',
        label: [
          <span key="submit.institution">
            <Link to={SUBMISSIONS_INSTITUTION}>Institution</Link>
          </span>,
        ],
      },
      {
        key: 'submit.experiment',
        label: [
          <span key="submit.experiment">
            <Link to={SUBMISSIONS_EXPERIMENT}>Experiment</Link>
          </span>,
        ],
      },
      {
        key: 'submit.journal',
        label: [
          <span key="submit.journal">
            <Link to={SUBMISSIONS_JOURNAL}>Journal</Link>
          </span>,
        ],
      },
    ];
  }

  let menuItems: MenuItem[] = [
    {
      key: 'help',
      label: 'Help',
      popupClassName: 'header-submenu ant-menu-dark',
      children: [
        {
          key: 'help.search-tips',
          label: [
            <span key="help.search-tips">
              <LinkWithTargetBlank href={PAPER_SEARCH_URL}>
                Search Tips
              </LinkWithTargetBlank>
            </span>,
          ],
        },
        {
          key: 'help.tour',
          label: [
            <span key="help.tour">
              <DisplayGuideButtonContainer color="white">
                Take the tour
              </DisplayGuideButtonContainer>
            </span>,
          ],
        },
        {
          key: 'help.help-center',
          label: [
            <span key="help.help-center">
              <LinkWithTargetBlank href={HELP_BLOG_URL}>
                Help Center
              </LinkWithTargetBlank>
            </span>,
          ],
        },
      ],
    },
    {
      key: 'submit',
      label: 'Submit',
      popupClassName: 'header-submenu ant-menu-dark',
      children: submitItems,
    },
  ];

  const accountItems = [
    {
      key: 'my-profile',
      label: profileControlNumber
        ? [
            <Link key="my-profile" to={USER_PROFILE_URL}>
              My profile
            </Link>,
          ]
        : [
            <Tooltip key="my-profile" title={CLAIMING_DISABLED_INFO}>
              <Button ghost disabled>
                My profile
              </Button>
            </Tooltip>,
          ],
    },
    {
      key: 'settings',
      label: [
        <Link key="settings" to={USER_SETTINGS}>
          Settings
        </Link>,
      ],
    },
    {
      key: 'logout',
      label: [
        <LinkLikeButton
          onClick={onLogoutClick}
          dataTestId="logout"
          color="white"
          key="logout"
        >
          Logout
        </LinkLikeButton>,
      ],
    },
    loggedInToHoldingpen && {
      key: 'logout-holdingpen',
      label: [
        <LinkLikeButton color="white" onClick={() => onLogout()}>
          Logout Holdingpen
        </LinkLikeButton>,
      ],
    },
  ];

  if (loggedIn) {
    menuItems = [
      ...menuItems,
      {
        key: 'account',
        label: 'Account',
        popupClassName: 'header-submenu ant-menu-dark',
        children: accountItems,
      },
    ];
  } else {
    menuItems = [
      ...menuItems,
      {
        key: 'login',
        label: (
          <Link key="login" to={USER_LOGIN}>
            Login
          </Link>
        ),
      },
    ];
  }

  return (
    <Menu
      className="__HeaderMenu__"
      theme="dark"
      mode="horizontal"
      selectable={false}
      items={menuItems}
    />
  );
};

export default HeaderMenu;
