import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

const Authorization = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-white">
      {mode === 'login' ? (
        <>
          <LoginForm />
          <Link 
            to="/authorization?mode=signup"
            className="text-blue-500 mt-4 hover:underline"
          >
            Don't have an account? Sign up
          </Link>
        </>
      ) : (
        <>
          <SignupForm />
          <Link
            to="/authorization?mode=login"
            className="text-blue-500 mt-4 hover:underline"
          >
            Already have an account? Sign in
          </Link>
        </>
      )}
    </div>
  );
};

export default Authorization;