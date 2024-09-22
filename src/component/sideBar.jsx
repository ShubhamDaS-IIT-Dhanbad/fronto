import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/sideBar.css';

import { FaPaperPlane } from "react-icons/fa";
import { TbLayoutDashboard } from "react-icons/tb";
import { IoCallOutline, IoSettingsOutline, IoNotificationsOutline } from "react-icons/io5";
import { TbMessageDots } from "react-icons/tb";
import { CiCloudRainbow } from "react-icons/ci";

import { BASE_URL } from '../../public/constant.js';
import avatar from '../assets/google.png';

const SideBar = ({ user, setUser, contact, activeItem, setActiveItem }) => {
  const navigate = useNavigate();

  const logOut = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      window.location.reload(); // Reload the page
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div id='sideBar'>
      <div id='sidebar-logo'>
        <FaPaperPlane id='sidebar-logo-paperplane' />
        <p>SwiftChat</p>
      </div>
      <div id='sidebar-icons'>
        {/* <div
          className={`sidebar-icons-divs ${activeItem === "Dashboard" ? "active" : ""}`}
          onClick={() => setActiveItem("Dashboard")}
        >
          <TbLayoutDashboard className='sidebar-icons-divs-icon' />
          Dashboard
        </div> */}
        {/* <div
          className={`sidebar-icons-divs ${activeItem === "Calls" ? "active" : ""}`}
          onClick={() => setActiveItem("Calls")}
        >
          <IoCallOutline className='sidebar-icons-divs-icon' />
          Calls
        </div> */}
        <div
          className={`sidebar-icons-divs ${activeItem === "Messages" ? "active" : ""}`}
          onClick={() => setActiveItem("Messages")}
        >
          <TbMessageDots className='sidebar-icons-divs-icon' />
          Messages
        </div>
        
        <div
          className={`sidebar-icons-divs ${activeItem === "Group" ? "active" : ""}`}
          onClick={() => setActiveItem("Group")}
        >
          <IoSettingsOutline className='sidebar-icons-divs-icon' />
          Groups
        </div>
        <div
          className={`sidebar-icons-divs ${activeItem === "Notification" ? "active" : ""}`}
          onClick={() => setActiveItem("Notification")}
        >
          <IoNotificationsOutline className='sidebar-icons-divs-icon' />
          Notification
        </div>
        <div
          className={`sidebar-icons-divs ${activeItem === "Aichatbot" ? "active" : ""}`}
          onClick={() => setActiveItem("Aichatbot")}
        >
          <CiCloudRainbow className='sidebar-icons-divs-icon' />
          AI ChatBot
        </div>
      </div>
      <div className='sidebar-footer'>
        <img className='profile-picture' src={avatar} alt="Profile" />
        <div id='profile-info'>
          <span id='profile-name'>{user.firstName}</span>
          <p id='logout-text' onClick={logOut}>Log out</p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;

