import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../utils/mutation';
import Auth from '../utils/auth';

const LoginForm = ({ handleModalClose }: { handleModalClose: () => void }) => {
  // Set initial form state
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });

  // Set state for form validation
  const [validated, setValidated] = useState(false);

  // Set state for alert
  const [showAlert, setShowAlert] = useState(false);

  // Set up the LOGIN_USER mutation
  const [loginUser, { error }] = useMutation(LOGIN_USER);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      // Use the LOGIN_USER mutation
      const { data } = await loginUser({
        variables: { ...userFormData },
      });

      if (!data) {
        throw new Error('Something went wrong!');
      }

      const { token } = data.login;
      Auth.login(token);

      // Close the modal after successful login
      handleModalClose();
    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    // Reset form data
    setUserFormData({
      email: '',
      password: '',
    });
    setValidated(false);
  };

  return (
    <>
      {/* This is needed for the validation functionality above */}
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        {/* Show alert if server response is bad */}
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant="danger">
          {error ? error.message : 'Something went wrong with your login!'}
        </Alert>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Your email address"
            name="email"
            onChange={handleInputChange}
            value={userFormData.email || ''}
            required
          />
          <Form.Control.Feedback type="invalid">Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="password">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Your password"
            name="password"
            onChange={handleInputChange}
            value={userFormData.password || ''}
            required
          />
          <Form.Control.Feedback type="invalid">Password is required!</Form.Control.Feedback>
        </Form.Group>

        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type="submit"
          variant="success"
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;