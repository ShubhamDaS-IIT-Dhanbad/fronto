import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../public/constant.js';
import { useSocket } from '../socketProvider.jsx'; // Use the socket from context
import '../style/group.css';

const Group = ({ user }) => {
    const [userGroups, setUserGroups] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messageContent, setMessageContent] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [groupName, setGroupName] = useState('');
    const navigate = useNavigate();

    const { socket, sendMessageInGroup } = useSocket();
    // Fetch user's groups on mount
    useEffect(() => {
        const fetchUserGroups = async () => {
            try {
                const { data } = await axios.get(`${BASE_URL}/api/fetchgroup?userId=${user._id}`);
                
                console.log(data)
                setUserGroups(data);
            } catch (err) {
                console.error("Error fetching user groups:", err);
            }
        };
        fetchUserGroups();
    }, [user._id]);

    // Listen for incoming messages from the socket
    useEffect(() => {
        if (!socket || !selectedGroup) return; // Ensure socket and group are selected

        const handleIncomingMessage = async ({ groupId, message }) => {
            console.log("ko");
            if (groupId === selectedGroup) {
                const userName = await fetchUserDataById(message.userId);
                setChatMessages((prevMessages) => [
                    ...prevMessages,
                    { user: message.userId, userName, message: message.content }
                ]);
            }
        };

       
        socket.on('received-message-from-group', ({userId,senderName,messageContent} )=>{
            console.log(userId,senderName,messageContent);
            console.log("message",messageContent)
            setChatMessages((prevMessages) => [
                ...prevMessages,
                {user:userId,userName:senderName, message: messageContent  }
            ]);
        });

        return () => {
            socket.off('received-message-from-group');
        };
    }, [selectedGroup, socket]);

    // Search for groups based on input
    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim()) {
            try {
                const { data } = await axios.get(`${BASE_URL}/api/searchgroup?query=${query}`);
                console.log(data)
                setSearchResults(data);
            } catch (err) {
                console.error("Error searching groups:", err);
            }
        } else {
            setSearchResults([]);
        }
    };

    // Create a new group
    const handleCreateGroup = async () => {
        if (newGroupName.trim()) {
            try {
                const { data } = await axios.post(`${BASE_URL}/api/creategroup?userId=${user._id}&groupName=${newGroupName}`);
                console.log(data);
                setUserGroups((prevGroups) => [...prevGroups, data]);
                setNewGroupName('');
            } catch (err) {
                console.error("Error creating group:", err);
            }
        }
    };

    // Fetch user data by ID
    const fetchUserDataById = async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/userdatabyid?userId=${userId}`);
            return `${response.data.firstName} ${response.data.lastName}`;
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    // Join a selected group and fetch its messages
    const handleJoinGroup = async (groupId) => {
        setSelectedGroup(groupId);
        try {
            const { data } = await axios.get(`${BASE_URL}/api/fetchgroupdetail?groupId=${groupId}`);
            console.log(data);
            setGroupName(data.groupName);
            const usersWithNames = await Promise.all(
                data.messages.map(async (msg) => {
                    const userName = await fetchUserDataById(msg.user);
                    return { ...msg, userName };
                })
            );
            setChatMessages(usersWithNames);

            // Join the group
            await axios.post(`${BASE_URL}/api/joingroup?userId=${user._id}&groupId=${groupId}`);
        } catch (err) {
            console.error("Error joining group:", err);
        }
    };

    // Send a message to the group
    const handleSendMessage = async () => {
        if (messageContent.trim() && selectedGroup) {
            const message = {
                groupId: selectedGroup,
                messageContent,
                senderSocketId: user._id,
            };

            // Emit the message through the socket
            console.log("here",user);
            const senderName=user.firstName+" "+user.lastName;
            sendMessageInGroup(selectedGroup, messageContent, socket.id,user._Id,senderName);

            const userName = await fetchUserDataById(user._id);
            setChatMessages((prevMessages) => [
                ...prevMessages,
                { user: user._id, userName, message: messageContent }
            ]);

            try {
                console.log(selectedGroup,"ko",user._id,"lp",messageContent)
                await axios.post(`${BASE_URL}/api/sendmessageingroup?groupId=${selectedGroup}&senderId=${user._id}&messageContent=${messageContent}`);
            } catch (err) {
                console.error("Error sending message to backend:", err);
            }

            setMessageContent(''); // Clear message input after sending
        }
    };

    return (
        <div className="group-container">
            <div className="group-sidebar">
                <div className="group-sidebar-yourgroup">
                    <h2>Your Groups</h2>
                    {userGroups.map(group => (
                        <div 
                            className="group-sidebar-yourgroup-groups" 
                            key={group?._id} 
                            onClick={() => handleJoinGroup(group?._id)} 
                            style={{ cursor: 'pointer' }}
                        >
                            {group?.groupName}
                        </div>
                    ))}
                </div>

                <div className="group-sidebar-creategroup">
                    <h3>CREATE A NEW GROUP</h3>
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Group Name"
                    />
                    <button onClick={handleCreateGroup}>Create Group</button>
                </div>

                <div className="group-sidebar-searchgroup">
                    <h2>SEARCH GROUP</h2>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search for a group"
                    />
                </div>
                {searchResults?.length > 0 && (
                    <div className='group-sidebar-resultgroup'>
                        <h3>SEARCH RESULT</h3>
                        <div>
                            {searchResults.map((group,key) => (
                                <div 
                                    className="group-sidebar-yourgroup-groups" 
                                    key={group._id} 
                                    onClick={() => handleJoinGroup(group._id)} 
                                    style={{ cursor: 'pointer' }}
                                >
                                    {group.groupName}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="group-chat">
                {selectedGroup ? (
                    <>
                        <h3>{groupName}</h3>
                        <div className="chat-window">
                            {chatMessages.map((msg, index) => (
                                <div key={index} className={`chat-message ${msg.user === user._id ? 'user' : 'other'}`}>
                                    <strong>{msg.userName}: </strong> {msg.message}
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Type your message"
                            className="message-input"
                        />
                        <button 
                            className="message-button"
                            onClick={handleSendMessage}
                        >
                            Send Message
                        </button>
                    </>
                ) : (
                    <h3>Select a group to see the chat</h3>
                )}
            </div>
        </div>
    );
};

export default Group;
