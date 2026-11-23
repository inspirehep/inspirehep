import { ReactNode } from 'react';
import { Row, Col } from 'antd';
import { Link, useInRouterContext } from 'react-router-dom';

type ErrorPageProps = {
  detail?: ReactNode;
  message: string;
  imageSrc: string;
  url?: string;
};

const ErrorPage = ({
  detail = null,
  message,
  imageSrc,
  url,
}: ErrorPageProps) => {
  const inRouter = useInRouterContext();

  return (
    <Col className="mt3 mb3" span={14}>
      <Row>
        <Col span={24}>
          <h3 className="f2 sm-f3 tc">{message}</h3>
        </Col>
      </Row>
      {detail && (
        <Row>
          <Col span={24}>
            <h3 className="f3 normal sm-f4 tc">{detail}</h3>
          </Col>
        </Row>
      )}
      {url && (
        <Row>
          <Col span={24}>
            <p className="f5 normal tc">
              Redirected from:{' '}
              {inRouter ? <Link to={url}>{url}</Link> : <a href={url}>{url}</a>}
            </p>
          </Col>
        </Row>
      )}
      <Row>
        <Col span={24}>
          <img src={imageSrc} alt="ERROR" />
        </Col>
      </Row>
    </Col>
  );
};

export default ErrorPage;
