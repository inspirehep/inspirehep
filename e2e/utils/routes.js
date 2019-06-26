const BASE_URL = 'http://ui:8081';
const HOME = BASE_URL;

const LOCAL_LOGIN = `${BASE_URL}/user/login/local`;

const AUTHOR_SUBMISSION = `${BASE_URL}/submissions/authors`;
const AUTHOR_SUBMISSION_API = `${BASE_URL}/api/submissions/authors`;
const LITERATURE_SUBMISSION = `${BASE_URL}/submissions/literature`;
const LITERATURE_SUBMISSION_API = `${BASE_URL}/api/submissions/literature`;
const JOB_SUBMISSION = `${BASE_URL}/submissions/jobs`;
const JOB_SUBMISSION_API = `${BASE_URL}/api/submissions/jobs`;
const JOB_API = `${BASE_URL}/api/jobs`;
const SUBMISSIONS_SUCCESS = `${BASE_URL}/submissions/success`;

const HOLDINGPEN_API = `${BASE_URL}/api/holdingpen`;

module.exports = {
  LOCAL_LOGIN,
  HOME,
  AUTHOR_SUBMISSION,
  AUTHOR_SUBMISSION_API,
  LITERATURE_SUBMISSION,
  LITERATURE_SUBMISSION_API,
  SUBMISSIONS_SUCCESS,
  HOLDINGPEN_API,
  JOB_SUBMISSION,
  JOB_SUBMISSION_API,
  JOB_API,
};
