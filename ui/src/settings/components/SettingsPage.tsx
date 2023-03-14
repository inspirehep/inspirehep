import React from 'react';
import { Row, Alert, Col, Card } from 'antd';
import { Link } from 'react-router-dom';

import OrcidPushSettingContainer from '../../authors/containers/OrcidPushSettingContainer';
import DocumentHead from '../../common/components/DocumentHead';
import EventTracker from '../../common/components/EventTracker';
import CollapsableForm from '../../submissions/common/components/CollapsableForm';
import { ChangeEmailForm } from './ChangeEmailForm/ChangeEmailForm';

const OPEN_SECTIONS = ['account_email', 'author_email', 'orcid'];

const SettingsPage = ({
  onChangeEmailAddress,
  loading,
  error,
  profileControlNumber,
  userOrcid,
  userEmail,
}: {
  onChangeEmailAddress: (({
    email,
  }: {
    email: string;
  }) => void | Promise<any>) &
    Function;
  loading: boolean;
  userEmail: string;
  error?: Map<string, string | number>;
  profileControlNumber?: number;
  userOrcid?: string;
}) => {
  return (
    <>
      <DocumentHead title="Settings" />

      {error && (
        <Row justify="center" align="middle" className="mv3">
          <Col xs={24} md={22} lg={21} xxl={18}>
            <Alert
              message={error.get('message') || 'Error occured'}
              type="error"
              showIcon
              closable
            />
          </Col>
        </Row>
      )}

      <Row justify="center" align="middle" className="mv3">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Card bodyStyle={{ padding: '12px 16px' }}>
            <h2>Settings</h2>
            <p>Manage your Inspire account</p>
          </Card>
        </Col>
      </Row>

      <Row justify="center" align="middle" className="mb3">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <CollapsableForm openSections={OPEN_SECTIONS}>
            <CollapsableForm.Section
              header="Account email address"
              key="account_email"
            >
              <ChangeEmailForm
                onChangeEmailAddress={onChangeEmailAddress}
                loading={loading}
                email={userEmail}
              />
            </CollapsableForm.Section>

            {profileControlNumber && (
              <CollapsableForm.Section
                header="Author email address"
                key="author_email"
              >
                <p>
                  Change the email addresses registered on your author profile.
                  These are used by other INSPIRE users to contact you and for
                  the automatic matching of your papers.
                </p>

                <EventTracker
                  eventCategory="Settings"
                  eventAction="Edit"
                  eventId={`Edit ${profileControlNumber} record`}
                >
                  <Link
                    to={`/submissions/authors/${profileControlNumber}`}
                    className="db pb3"
                    data-test-id="author-form"
                  >
                    Update author information
                  </Link>
                </EventTracker>
              </CollapsableForm.Section>
            )}

            {userOrcid && profileControlNumber && (
              <CollapsableForm.Section header="Orcid settings" key="orcid">
                <OrcidPushSettingContainer />
              </CollapsableForm.Section>
            )}
          </CollapsableForm>
        </Col>
      </Row>
    </>
  );
};

export default SettingsPage;
