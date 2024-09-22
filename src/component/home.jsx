import React, { useEffect, useState } from 'react';
import '../style/home.css';

import axios from 'axios';
import SideBar from './sideBar';
import Message from './message';
import Chat from './chat.jsx';
import Notification from './notification.jsx';
import Group from './group.jsx';
import AiChatBot from './aiChatbot.jsx';

import { BASE_URL } from '../../public/constant.js';
import { useSocket } from '../socketProvider.jsx'; // Ensure correct socket import

const Home = ({ user, setUser, contact, setContact }) => {
    const [whom, setWhom] = useState(null);
    const [activeItem, setActiveItem] = useState("Messages");
    const socket = useSocket().socket;
    useEffect(() => {
        if (!user || !socket) return;

        const updateSocketId = async () => {
            try {
                await axios.post(`${BASE_URL}/api/updatedata?uid=${user.uid}&socketId=${socket.id}`);
            } catch (error) {
                console.error('Error updating socket ID:', error);
            }
        };

        updateSocketId();
    }, [user, socket]);

    useEffect(() => {
        if (!user || !socket) return;

        const fetchUserData = async () => {
            try {
                const response = await axios.post(`${BASE_URL}/api/updatedata?uid=${user.uid}&socketId=${socket.id}`);
                setUser(response.data);
                console.log(response)
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [user?.uid, socket?.id, setUser]);

    return (
        <div id="home">
            <SideBar
                user={user}
                setUser={setUser}
                socket={socket}
                contact={contact}
                setWhom={setWhom}
                activeItem={activeItem}
                setActiveItem={setActiveItem}
            />
            <div id="main-content">
                {activeItem === "Messages" && (
                    <div id="message">
                        <Message
                            user={user}
                            socket={socket}
                            whom={whom}
                            setWhom={setWhom}
                            contact={contact}
                            setContact={setContact}
                        />
                        <Chat
                            user={user}
                            socket={socket}
                            whom={whom}
                            contact={contact}
                            setContact={setContact}
                        />
                    </div>
                )}

                {activeItem === "Notification" && (
                    <div id="notification">
                        <Notification user={user} />
                    </div>
                )}

                {activeItem === "Group" && (
                    <div id="group">
                        <Group user={user} />
                    </div>
                )}

                {activeItem === "Aichatbot" && (
                    <div id="Aichatbot">
                        <AiChatBot user={user} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
