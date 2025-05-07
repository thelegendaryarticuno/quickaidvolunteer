import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginSchema } from '../utils/validationSchemas';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/loader.png';

const LoginForm = () => {
    const navigate = useNavigate();
    const [loginError, setLoginError] = useState('');

    const handleLogin = async (values, { setSubmitting }) => {
        try {
            const response = await axios.post('https://quickaid-backend-7mpc.onrender.com/volunteer/login', {
                phone: values.phone,
                password: values.password
            });
            if (response.data.success) {
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('volunteerId', response.data.volunteerID);
                navigate('/app-home');
            } else {
                setLoginError('Login failed. Please check your credentials.');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred during login';
            setLoginError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto px-6 py-8">
            <div className="text-center mb-8">
                <img
                    src={logo}
                    alt="QuickAid Logo"
                    className="w-80 h-40 mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Login or Signup</h2>
            </div>

            <Formik
                initialValues={{ phone: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div className="flex items-center border-2 border-gray-200 rounded-lg px-3 py-2 mb-4">
                            <span className="text-gray-500 mr-2">🇮🇳 +91</span>
                            <Field
                                id="phone"
                                name="phone"
                                type="text"
                                placeholder="Enter your phone number"
                                className="flex-1 outline-none border-none bg-transparent"
                            />
                        </div>
                        <ErrorMessage
                            name="phone"
                            component="div"
                            className="text-red-500 text-sm"
                        />

                        <Field
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create or Enter your password"
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 outline-none"
                        />
                        <ErrorMessage
                            name="password"
                            component="div"
                            className="text-red-500 text-sm"
                        />

                        {loginError && (
                            <div className="text-red-500 text-sm">
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-500 text-white rounded-full py-3 font-medium mb-3"
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className="w-full bg-blue-500 text-white rounded-full py-3 font-medium"
                        >
                            Signup with OTP
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default LoginForm;