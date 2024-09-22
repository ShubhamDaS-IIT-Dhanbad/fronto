import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { useSocket } from './socketProvider.jsx';
const Home = lazy(() => import('./component/home.jsx'));
const Login = lazy(() => import('./component/login.jsx'));

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [contact, setContact] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    const localStorageUser = localStorage.getItem('user');
    if (localStorageUser) {
      const parsedUser = JSON.parse(localStorageUser);
      setUser(parsedUser);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {user ? (
          <Route
            path='/'
            element={<Home user={user} setUser={setUser} socket={socket} contact={contact} setContact={setContact} />}
          />
        ) : (
          <>
            <Route path='/login' element={<Login setUser={setUser} socket={socket} />} />
          </>
        )}
        <Route path='*' element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>
    </Suspense>
  );
};

export default App;
