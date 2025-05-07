import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { FaPhoneAlt, FaMapMarkerAlt, FaSms, FaUserCircle } from 'react-icons/fa';
import { MdLightMode, MdDarkMode } from 'react-icons/md';
import axios from 'axios';
import logo from '../assets/images/logo.png';

const AppHome = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [emergencies, setEmergencies] = useState([]);
  const [acceptedSOS, setAcceptedSOS] = useState(null);
  const [victimPhone, setVictimPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [socketRef, setSocketRef] = useState(null);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('volunteerId');
    window.location.href = '/';
  };

  useEffect(() => {
    const volunteerId = sessionStorage.getItem('volunteerId');
    const token = sessionStorage.getItem('token');
    if (!token || !volunteerId) {
      navigate('/');
      return;
    }

    // Check volunteer status
    axios.post(`https://quickaid-backend-7mpc.onrender.com/volunteer/status/${volunteerId}`)
      .then(async (res) => {
        if (res.data.success && res.data.volunteerStatus === 'active') {
          const sosRes = await axios.get(`https://quickaid-backend-7mpc.onrender.com/volunteer/sosSearch/${volunteerId}`);
          if (sosRes.data.success && sosRes.data.data) {
            const sos = sosRes.data.data;
            setAcceptedSOS({
              sosId: sos.sosId,
              address: sos.address,
              type: sos.type,
              name: sos.name,
              location: sos.location,
              timestamp: new Date().toISOString()
            });
            setVictimPhone(sos.phone);
          }
          setLoading(false);
        } else {
          const socket = io('https://quickaid-backend-7mpc.onrender.com');
          setSocketRef(socket);
          socket.on('connect', () => {
            socket.emit('join-volunteer-room', volunteerId);
          });
          socket.on('sos-alert', (sosData) => {
            const formattedEmergency = {
              sosId: sosData.sosId,
              address: sosData.address,
              type: sosData.type,
              name: sosData.name,
              location: sosData.location,
              timestamp: new Date().toISOString(),
              sosStatus: sosData.sosStatus,
              timeGapMinutes: sosData.timeGapMinutes
            };
            setEmergencies(prev => {
              if (prev.some(e => e.sosId === formattedEmergency.sosId)) return prev;
              return [formattedEmergency, ...prev];
            });
          });
          setLoading(false);
          return () => socket.disconnect();
        }
      })
      .catch(() => {
        setLoading(false);
        navigate('/');
      });
  }, [navigate]);

  const handleAccept = async (emergency) => {
    try {
      const volunteerId = sessionStorage.getItem('volunteerId');
      await axios.post(
        `https://quickaid-backend-7mpc.onrender.com/victim/sos/${emergency.sosId}/accept`,
        { volunteerId }
      );
      if (socketRef) socketRef.disconnect();
      window.location.reload();
    } catch (err) {
      alert('Failed to accept SOS. Try again.');
    }
  };

  const handleComplete = async (sosId) => {
    try {
      await axios.post(`https://quickaid-backend-7mpc.onrender.com/victim/sos/${sosId}/completed`);
      window.location.reload();
    } catch (err) {
      alert('Failed to mark as complete. Try again.');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navbar */}
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-400 to-blue-200'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <img src={logo} alt="QuickAid" className="h-8 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                {darkMode ? <MdLightMode className="h-6 w-6" /> : <MdDarkMode className="h-6 w-6" />}
              </button>
              <FaUserCircle className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className={`text-4xl font-bold text-center mb-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
          Emergency Dashboard
        </h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          </div>
        ) : acceptedSOS ? (
          <div className="max-w-lg mx-auto">
            <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Active Emergency</h2>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span>{acceptedSOS.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{acceptedSOS.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Address:</span>
                  <span>{acceptedSOS.address}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="flex space-x-3">
                  <a href={`tel:${victimPhone}`} className={`p-2 rounded-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
                    <FaPhoneAlt />
                  </a>
                  <a href={`sms:${victimPhone}`} className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                    <FaSms />
                  </a>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${acceptedSOS.location.latitude},${acceptedSOS.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                    <FaMapMarkerAlt />
                  </a>
                </div>
                <button
                  onClick={() => handleComplete(acceptedSOS.sosId)}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        ) : emergencies.length > 0 ? (
          <div className="w-full overflow-y-auto">
            <div
              className="flex flex-col gap-6 md:gap-8 lg:gap-10 py-4"
              style={{
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto'
              }}
            >
              {emergencies.map((emergency) => (
                <div
                  key={emergency.sosId}
                  className={`rounded-lg shadow-lg p-6 flex-shrink-0 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                  style={{
                    minWidth: '320px',
                    maxWidth: '350px',
                    scrollSnapAlign: 'center'
                  }}
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{emergency.type}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{new Date(emergency.timestamp).toLocaleString()}</p>
                    {emergency.timeGapMinutes && (
                      <p className="text-sm text-gray-500 mt-1">{emergency.timeGapMinutes} minutes ago</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {emergency.name}</p>
                    <p><span className="font-medium">Address:</span> {emergency.address}</p>
                  </div>
                  <button
                    onClick={() => handleAccept(emergency)}
                    className={`mt-4 w-full py-2 rounded-lg ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                  >
                    Accept Emergency
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-xl">No emergencies live yet</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`fixed bottom-8 right-8 px-6 py-3 rounded-full shadow-lg ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
            } text-white`}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AppHome;