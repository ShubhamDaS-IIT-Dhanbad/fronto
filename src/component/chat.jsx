import React, { useEffect, useState } from 'react';
// import { useSocket } from '../socketProvider.jsx';
import axios from 'axios';
import { BASE_URL } from '../../public/constant';
import TextChats from './TextChats';
import google from '../assets/google.png';
import { HiMiniMicrophone } from "react-icons/hi2";
import { BsSend } from "react-icons/bs";
import { MdOutlineAddLocationAlt } from "react-icons/md";
import { TbPhotoSearch } from "react-icons/tb";
import { BsEmojiSmile } from "react-icons/bs";

import '../style/chat.css';

function Chat({ user, whom, setWhom }) {
  // const socket = useSocket();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Load chat history for the selected contact
  useEffect(() => {
    if (whom) {
      // Load messages from local storage
      try {
        const storedMessages = JSON.parse(localStorage.getItem(`messages_${whom._id}`)) || [];
        setMessages(storedMessages);
      } catch (e) {
        console.error("Error parsing stored messages:", e);
        localStorage.removeItem(`messages_${whom._id}`); // Clear invalid data
        setMessages([]);
      }

      const fetchMessages = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/get?user1=${user._id}&user2=${whom._id}`);
          const fetchedMessages = response.data.chat.chat.map((chat) => ({
            side: chat.sender === user._id ? 'right' : 'left',
            text: chat.content,
            sender: chat.sender,
            receiver: chat.receiver
          }));
          setMessages(fetchedMessages);
          localStorage.setItem(`messages_${whom._id}`, JSON.stringify(fetchedMessages));
        } catch (err) {
          console.error("Error fetching messages:", err);
          setMessages([]);
        }
      };

      // Fetch messages initially and then every second
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 1000); // Fetch every second

      return () => clearInterval(intervalId); // Clear interval on unmount
    }
  }, [whom, user]);

  // Handle receiving messages
  useEffect(() => {
    const handleMessageReceive = (newMessage) => {
      if (newMessage.receiver === whom?._id || newMessage.sender === whom?._id) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, newMessage];
          localStorage.setItem(`messages_${whom._id}`, JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      }
    };
  }, [whom]);

  // Send a message and store it in local storage
  const handleMessageSend = async () => {
    if (message.trim() !== '' && whom) {
      const newMessage = { side: 'right', text: message, sender: user._id, receiver: whom._id };
      try {
        await axios.post(`${BASE_URL}/api/send?user1=${user._id}&user2=${whom._id}&content=${message}&sender=${user._id}`);
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, newMessage];
          localStorage.setItem(`messages_${whom._id}`, JSON.stringify(updatedMessages));
          return updatedMessages;
        });
        socket.emit('send-message', newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
      setMessage(''); // Clear input field after sending
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleMessageSend();
    }
  };

  return (
    <>
      {whom ? (
        <div className='chat'>
          <div id='chat-header'>
            <div id='chat-header-div'>
              <img src={google} id='message-component-image' alt='profile' />
              <div id='message-component-name'>
                <p id='chat-component-name-p'>{whom.firstName}</p>
                <p id='chat-component-name-typing'>{whom.userName}</p>
              </div>
            </div>
          </div>

          <div className='chat-area'>
            {messages.map((msg, index) => (
              <TextChats key={index} message={msg} />
            ))}
          </div>

          <div className='chat-footer'>
            <div id='chat-footer-div'>
              <HiMiniMicrophone />
              <input
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder='Type a message...'
              />
              <BsSend onClick={handleMessageSend} />
              <MdOutlineAddLocationAlt />
              <TbPhotoSearch />
              <BsEmojiSmile />
            </div>
          </div>
        </div>
      ) : (
        <div className='chat'>
          <p>Select a contact to start a chat</p>
        </div>
      )}
    </>
  );
}

export default Chat;
