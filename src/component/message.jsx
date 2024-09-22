import React, { useState, useEffect } from "react";
import '../style/message.css';

import { FaPlus } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { GiCrossedBones } from "react-icons/gi";
import axios from 'axios';

import { BASE_URL } from "../../public/constant";
import MessageComponent from "./messageComponent";
import SearchResultComponent from "./searchResultComponent"; // Import the new component

const Message = ({ user, whom, setWhom, contact, setContact}) => {
    const [loading, setLoading] = useState(true);
    const [addFriend, setAddFriend] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const fetchContactData = async () => {
            if (user.contact && user.contact.length > 0) {
                try {
                    const contactPromises = user.contact.map(async (_id) => {
                        const response = await axios.get(`${BASE_URL}/api/contactdata?_id=${_id}`);
                        return response.data;
                    });
                    const contacts = await Promise.all(contactPromises);
                    setContact(contacts);
                } catch (error) {
                    console.error("Error in fetching contact", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false); // Ensure loading is set to false if no contacts
            }
        };

        fetchContactData();
        const intervalId = setInterval(fetchContactData, 10000); // Adjusted interval to 10 seconds
        return () => clearInterval(intervalId);
    }, [user, setContact]);

    const handleContactClick = (contact) => {
        setWhom(contact);
        console.log('Whom set to:', contact);
    };

    const handleAddFriendClick = () => {
        setAddFriend(true);
    };

    const closeAddFriend = () => {
        setAddFriend(false);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearch = async () => {
        if (searchQuery.trim() === "") return; // Avoid search with empty query
        try {
            const response = await axios.get(`${BASE_URL}/api/username?userName=${searchQuery}`);
            setSearchResults(response.data);
            console.log("lp",response);
        } catch (error) {
            console.error("Error in searching users", error);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleSendFriendRequest = async (result) => {
        try {
            await axios.post(`  ${BASE_URL}/api/sendfriendrequest?sender=${user._id}&receiver=${result._id}`);
            console.log('Friend request sent to:', result);
        } catch (err) {
            console.error("Error sending friend request", err);
        }
    };

    return (
        <>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="message">
                    <div className="message-search">
                        <p>Message</p>
                        <div className="message-search-div">
                            <FaPlus className="message-add-icon" onClick={handleAddFriendClick} />
                            <IoSearch className="message-search-icon" />
                        </div>
                    </div>
                    <div className="message-box">
                        {contact.map((contact, key) => (
                            <MessageComponent 
                                key={key} 
                                name={contact.firstName} 
                                onClick={() => handleContactClick(contact)} 
                                online={contact.online}
                            />
                        ))}
                    </div>
                    {addFriend && (
                        <div className="add-friend-container">
                            <div className="add-friend">
                                <GiCrossedBones className="add-friend-cross" onClick={closeAddFriend} />
                                <input
                                    type="text"
                                    placeholder="Search by username"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchKeyDown} // Add this line
                                    className="search-input"
                                />
                                <i className="fa-solid fa-magnifying-glass search" onClick={handleSearch}></i>
                            </div>
                            <div className="search-results">
                                {searchResults.length > 0 ? (
                                    searchResults.map((result, key) => (
                                        <SearchResultComponent 
                                            key={key} 
                                            result={result} 
                                            handleSendFriendRequest={handleSendFriendRequest} // Fixed prop name
                                        />
                                    ))
                                ) : (
                                    <p>No results found</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default Message;
