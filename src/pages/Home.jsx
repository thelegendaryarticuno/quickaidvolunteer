import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/loader.png';

const Home = () => {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    setLogoLoaded(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 relative bg-white">
      <div className="relative w-100 h-50 mb-8">
        <img 
          src={logo} 
          alt="Quick Aid Logo"
          className={`w-full h-full object-contain transition-transform duration-1000 ${
            logoLoaded ? 'scale-100' : 'scale-0'
          }`}
        />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          to="/authorization?mode=login"
          className="py-4 px-8 rounded-full text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg bg-blue-600 text-white hover:bg-blue-500"
        >
          Sign In
        </Link>

        <Link
          to="/authorization?mode=signup"
          className="py-4 px-8 rounded-full text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg bg-red-600 text-white hover:bg-red-500"
        >
          New User? Join Now
        </Link>
      </div>
    </div>
  );
};

export default Home;