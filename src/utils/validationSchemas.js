import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});


export const signupSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  skills: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one skill is required')
    .required('Skills are required'),
  idProof: Yup.string().required('ID proof is required'),
  location: Yup.object().shape({
    latitude: Yup.number().required('Latitude is required'),
    longitude: Yup.number().required('Longitude is required'),
  }),
});