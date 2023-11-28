import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';

//Import formik validation
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  Alert,
  Form,
  Input,
  Button,
  FormFeedback,
  Label,
  InputGroup,
} from 'reactstrap';

//Import actions and helpers
import { forgetPassword, codeSent, apiError } from '../../redux/actions';

//i18n
import { useTranslation } from 'react-i18next';

//Import Images
import logodark from '../../assets/images/logo-dark.png';
import logolight from '../../assets/images/logo-light.png';

/**
 * Forget Password component
 * @param {*} props
 */
const ForgetPassword = (props) => {
  const clearError = () => {
    props.apiError('');
  };

  /* intilize t variable for multi language implementation */
  const { t } = useTranslation();

  useEffect(clearError);

  // validation
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      verifCode: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Required'),
      //password: Yup.string().required('Required'),
      //verifCode: Yup.string().required('Required'),
    }),
    onSubmit: (values) => {
      console.log(values);
      if (values.action === 'sendCode') {
        props.codeSent(values.email);
      } else if (values.action === 'resetPassword') {
        props.forgetPassword(values.email, values.password, values.verifCode);
      }
    },
  });

  if (localStorage.getItem('authUser')) {
    return <Navigate to="/" />;
  }

  document.title =
    'Forgot Password | Immerse React - Responsive Bootstrap 5 Chat App';

  return (
    <React.Fragment>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <div className="text-center mb-4">
                <Link to="/" className="auth-logo mb-5 d-block">
                  <img
                    src={logodark}
                    alt=""
                    height="30"
                    className="logo logo-dark"
                  />
                  <img
                    src={logolight}
                    alt=""
                    height="30"
                    className="logo logo-light"
                  />
                </Link>

                <h4>{t('Reset Password')}</h4>
                <p className="text-muted mb-4">
                  {t('Reset Password With Immerse.')}
                </p>
              </div>

              <Card>
                <CardBody className="p-4">
                  <div className="p-3">
                    {props.error && (
                      <Alert variant="danger">{props.error}</Alert>
                    )}
                    {props.error && (
                      <Alert variant="success">{props.codeSent}</Alert>
                    )}
                    {props.passwordResetStatus ? (
                      <Alert variant="success" className="text-center mb-4">
                        {props.passwordResetStatus}
                      </Alert>
                    ) : (
                      <Alert variant="success" className="text-center mb-4">
                        {t(
                          'Enter your Email and send verification code to your email'
                        )}
                        !
                      </Alert>
                    )}
                    <Form onSubmit={formik.handleSubmit}>
                      <FormGroup className="mb-4">
                        <Label className="form-label">{t('Email')}</Label>
                        <InputGroup className="mb-3 bg-soft-light rounded-3">
                          <span className="input-group-text border-light text-muted">
                            <i className="ri-mail-line"></i>
                          </span>
                          <Input
                            type="text"
                            id="email"
                            name="email"
                            className="form-control form-control-lg border-light bg-soft-light"
                            placeholder="Enter Email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            invalid={
                              formik.touched.email && formik.errors.email
                                ? true
                                : false
                            }
                          />
                          {formik.touched.email && formik.errors.email ? (
                            <FormFeedback type="invalid">
                              {formik.errors.email}
                            </FormFeedback>
                          ) : null}
                        </InputGroup>
                      </FormGroup>
                      {/* New Password field */}
                      <FormGroup className="mb-4">
                        <Label className="form-label">New Password</Label>
                        <InputGroup className="mb-3 bg-soft-light rounded-3">
                          <Input
                            type="password" // Assuming it's a password field
                            id="password"
                            name="password"
                            className="form-control form-control-lg border-light bg-soft-light"
                            placeholder="Enter New Password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            invalid={
                              formik.touched.password && formik.errors.password
                                ? true
                                : false
                            }
                          />
                          {formik.touched.password && formik.errors.password ? (
                            <FormFeedback type="invalid">
                              {formik.errors.password}
                            </FormFeedback>
                          ) : null}
                        </InputGroup>
                      </FormGroup>
                      <FormGroup className="mb-4">
                        <Label className="form-label">Verification Code</Label>
                        <InputGroup className="mb-3 bg-soft-light rounded-3">
                          <Input
                            type="text"
                            id="verifCode"
                            name="verifCode"
                            className="form-control form-control-lg border-light bg-soft-light"
                            placeholder="Enter Verification Code"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.verifCode}
                            invalid={
                              formik.touched.verifCode &&
                              formik.errors.verifCode
                                ? true
                                : false
                            }
                          />
                          {formik.touched.verifCode &&
                          formik.errors.verifCode ? (
                            <FormFeedback type="invalid">
                              {formik.errors.verifCode}
                            </FormFeedback>
                          ) : null}
                        </InputGroup>
                      </FormGroup>

                      <div className="d-grid">
                        <Button
                          color="primary"
                          block
                          className="waves-effect waves-light"
                          type="submit"
                          onClick={() =>
                            formik.setFieldValue('action', 'sendCode')
                          }
                        >
                          Send Code
                        </Button>
                      </div>
                      <br></br>
                      <div className="d-grid">
                        <Button
                          color="primary"
                          block
                          className="waves-effect waves-light"
                          type="submit"
                          onClick={() =>
                            formik.setFieldValue('action', 'resetPassword')
                          }
                        >
                          {t('Reset Password')}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>

              <div className="mt-5 text-center">
                <p>
                  {t('Remember It')} ?{' '}
                  <Link to="login" className="font-weight-medium text-primary">
                    {' '}
                    {t('Signin')}{' '}
                  </Link>{' '}
                </p>
                <p>
                  © {new Date().getFullYear()} {t('Immerse')}.{' '}
                  {t('Crafted with')}{' '}
                  <i className="mdi mdi-heart text-danger"></i>{' '}
                  {t('by Themesbrand')}
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  const { user, loading, error, passwordResetStatus, codeSent } = state.Auth;
  return { user, loading, error, passwordResetStatus, codeSent };
};

export default connect(mapStateToProps, { forgetPassword, codeSent, apiError })(
  ForgetPassword
);
