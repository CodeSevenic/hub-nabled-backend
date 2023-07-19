﻿import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStateContext } from '../contexts/ContextProvider';
import { useNavigate } from 'react-router-dom';
import { useAuthStateContext } from '../contexts/AuthContext';

const AddAccount = () => {
  const [apps, setApps] = useState([]);
  const { authPopup, setAuthPopup } = useStateContext();
  const { authAccountDeleted, hubSpotIds, handleDeleteAccount, setIsLoggedIn } =
    useAuthStateContext();

  const navigate = useNavigate();
  // Fetch apps from backend
  const fetchApps = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/apps');
      setApps(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const installApp = (app) => {
    setAuthPopup(false);
    console.log('App: ', app);
    const userId = sessionStorage.getItem('userId');
    const redirectUri = 'http://localhost:4000/api/install';
    const url = `${redirectUri}?app_id=${app.appId}&userId=${userId}&appName=${app.appName}`;

    // Store the window reference
    window.oauthWindow = window.open(
      url,
      'OAuthWindow',
      'height=600,width=800,location=yes,scrollbars=yes'
    );
  };

  useEffect(() => {
    fetchApps();

    const handleStorageChange = () => {
      if (localStorage.getItem('oauth_complete') === 'true') {
        fetchApps();

        // Send a message to the OAuth window to close itself
        if (window.oauthWindow) {
          window.oauthWindow.postMessage({ command: 'close' }, 'http://localhost:3000'); // target origin
        }
        setAuthPopup(true);
        // check sessionStorage for isLoggedIn value and convert to boolean
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
          setIsLoggedIn(true);
        }
        localStorage.removeItem('oauth_complete');

        navigate(`/hs-account/${hubSpotIds[0]}`);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    console.log('window.addEventListener happened on UserDashboard.js');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <button
      className="text-white font-semibold text-sm w-fit m-3 mt-8 mb-5 bg-btn1 px-5 py-2 rounded-xl ml-2 block hover:shadow-lg transition-all duration-300"
      onClick={() => installApp(apps[0])}
    >
      Connect HubSpot Account
    </button>
  );
};

export default AddAccount;