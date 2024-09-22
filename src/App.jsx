import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { useSocket } from './socketProvider.jsx'; // Access the socket through SocketProvider
import axios from 'axios'
const Home = lazy(() => import('./component/home.jsx'));
const Login = lazy(() => import('./component/login.jsx'));
import { BASE_URL } from '../public/constant.js';

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
  }, [navigate, socket.id]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route
          path='/'
          element={user ? (
            <Home user={user} setUser={setUser} socket={socket} contact={contact} setContact={setContact} />
          ) : (
            <Navigate to='/login' />
          )}
        />
        <Route
          path='/login'
          element={!user ? (
            <Login setUser={setUser} socket={socket} />
          ) : (
            <Navigate to='/' />
          )}
        />
        <Route path='*' element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>
    </Suspense>
  );
};

export default App;
