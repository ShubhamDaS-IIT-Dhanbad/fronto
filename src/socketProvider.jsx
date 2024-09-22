import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BASE_URL } from '../public/constant.js'; // Adjust the path if necessary

const SocketContext = createContext(null);

// Custom hook to use the socket instance
export const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]); // State for storing messages

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io({BASE_URL}); // Adjust BASE_URL if necessary
        setSocket(newSocket);

        // Handle socket connection
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        // Handle socket disconnection
        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        // Clean up on unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Function to send a message to a group
    const sendMessageInGroup = (groupId, messageContent, senderSocketId,userId,senderName ) => {
        const message = { groupId, messageContent, senderSocketId,userId,senderName  };
        if (socket) {
            socket.emit('send-message-group', message);
            // Update local message state
            setMessages((prevMessages) => [...prevMessages, message]);
        } else {
            console.error("Socket is not initialized");
        }
    };

    return (
        <SocketContext.Provider value={{ socket, sendMessageInGroup, messages }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
