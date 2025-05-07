import React, { useState, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { signupSchema } from '../utils/validationSchemas';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/loader.png';

const SignupForm = () => {
    const navigate = useNavigate();
    const [signupError, setSignupError] = useState('');

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    (error) => reject(error)
                );
            } else {
                reject(new Error('Geolocation is not supported'));
            }
        });
    };

    return (
        <div className="w-full max-w-md mx-auto px-6 py-8">
            <div className="text-center mb-8">
                <img
                    src={logo}
                    alt="QuickAid Logo"
                    className="w-80 h-40 mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Create Your Account</h2>
            </div>

            <Formik
                initialValues={{
                    name: '',
                    phone: '',
                    password: '',
                    skills: [],
                    idProof: '',
                    address: '',
                    location: { latitude: 0, longitude: 0 },
                }}
                validationSchema={signupSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        let skillsArray = values.skills;
                        if (typeof values.skills === 'string') {
                            skillsArray = values.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
                        }

                        const formData = {
                            name: values.name,
                            phone: values.phone,
                            password: values.password,
                            skills: skillsArray,
                            idProof: values.idProof,
                            location: values.location,
                            address: values.address || `Lat: ${values.location.latitude}, Long: ${values.location.longitude}`
                        };

                        const response = await axios.post('https://quickaid-backend-7mpc.onrender.com/volunteer/signup', formData);

                        if (response.data.success) {
                            sessionStorage.setItem('token', response.data.token);
                            sessionStorage.setItem('volunteerID', response.data.volunteerID);
                            navigate('/app-home');
                        }
                    } catch (error) {
                        setSignupError(error.response?.data?.message || 'An error occurred during signup');
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ setFieldValue, values, isSubmitting }) => {
                    const onDrop = useCallback(async (acceptedFiles) => {
                        const file = acceptedFiles[0];
                        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
                            const formData = new FormData();
                            formData.append('image', file);

                            try {
                                const response = await axios.post('https://ecommercebackend-8gx8.onrender.com/image/image-upload', formData, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data'
                                    }
                                });
                                setFieldValue('idProof', response.data.imageUrl);
                            } catch (error) {
                                console.error('Error uploading image:', error);
                            }
                        }
                    }, [setFieldValue]);

                    const { getRootProps, getInputProps, isDragActive } = useDropzone({
                        onDrop,
                        accept: {
                            'image/jpeg': ['.jpg', '.jpeg'],
                            'image/png': ['.png']
                        },
                        multiple: false
                    });

                    return (
                        <Form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-gray-700 mb-1">Full Name</label>
                                <Field
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 outline-none text-gray-800"
                                />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-gray-700 mb-1">Phone Number</label>
                                <div className="flex items-center border-2 border-gray-200 rounded-lg px-3 py-2">
                                    <span className="text-gray-700 mr-2">🇮🇳 +91</span>
                                    <Field
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        placeholder="Enter your phone number"
                                        className="flex-1 outline-none border-none bg-transparent text-gray-800"
                                    />
                                </div>
                                <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
                                <Field
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Create a password"
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 outline-none text-gray-800"
                                />
                                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label htmlFor="skills" className="block text-gray-700 mb-1">Skills</label>
                                <Field
                                    id="skills"
                                    name="skills"
                                    type="text"
                                    placeholder="Enter skills (comma-separated)"
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 outline-none text-gray-800"
                                    onChange={(e) => {
                                        const skillsArray = e.target.value.split(',')
                                            .map(skill => skill.trim())
                                            .filter(skill => skill !== '');
                                        setFieldValue('skills', skillsArray);
                                    }}
                                />
                                <ErrorMessage name="skills" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1">ID Proof</label>
                                <div 
                                    {...getRootProps()} 
                                    className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-red-500 transition-colors"
                                >
                                    <input {...getInputProps()} />
                                    {isDragActive ? (
                                        <p className="text-gray-700">Drop the image here...</p>
                                    ) : (
                                        <p className="text-gray-700">Drag & drop an image (JPG/PNG) here, or click to select</p>
                                    )}
                                    {values.idProof && <p className="text-green-500 mt-2">Image uploaded successfully!</p>}
                                </div>
                                <ErrorMessage name="idProof" component="div" className="text-red-500 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-gray-700 mb-1">Address</label>
                                <Field
                                    id="address"
                                    name="address"
                                    type="text"
                                    placeholder="Enter your address"
                                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 outline-none text-gray-800"
                                    value={values.location.latitude !== 0 ?
                                        `Lat: ${values.location.latitude}, Long: ${values.location.longitude}` :
                                        values.address}
                                    readOnly={values.location.latitude !== 0}
                                />
                                <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {signupError && (
                                <div className="text-red-500 text-sm">
                                    {signupError}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const location = await getCurrentLocation();
                                        setFieldValue('location', location);
                                    } catch (error) {
                                        console.error('Error getting location:', error);
                                    }
                                }}
                                className="w-full bg-blue-500 text-white rounded-full py-3 font-medium mb-3 hover:bg-blue-600 transition-colors"
                            >
                                Get Current Location
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-red-500 text-white rounded-full py-3 font-medium hover:bg-red-600 transition-colors"
                            >
                                Sign Up
                            </button>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default SignupForm;