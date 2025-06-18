import React, { useState, useEffect, useRef } from "react";
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { IoIosSend } from "react-icons/io";
import axios from 'axios';
import Header from './Header';


const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [User, setUser] = useState(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setUser(response.data);
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchUserData();
  }, []);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const response = await axios.post("http://localhost:5002/chat", {
      message: userMessage.text,
      userId: `${User._id}`
    });

    const botResponse = {
      sender: "bot",
      text: response.data.response,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    

    setTimeout(() => {
      setMessages((prev) => [...prev, botResponse]);
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
    <div className="bg-white w-screen">
      <Header/>
    </div>
    <div className="md:px-20 bg-transparent flex md:flex-col justify-center min-w-screen min-h-screen items-center bg-[url('/images/bg.jpg')] ">
    
    <div className="flex flex-col font-inter  md:w-5xl h-[60vh] shadow-2xl rounded-2xl shrink-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white text-white shadow-md rounded-t-xl shrink-0">
        <img src = "/images/therapist.jpg" className="h-10 w-10 rounded-full"></img>
        <h1 className="text-lg font-semibold text-black">Safespace AI Therapist</h1>
        <span className="ml-auto text-sm bg-green-500 px-2 py-1 rounded-full">Online</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#efefef]">
        {messages.map((msg, i) => {
          const isUser = msg.sender === "user";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow-md text-sm relative shrink-0 ${
                  isUser ? "bg-blue-100 text-right text-black" : "bg-white text-black text-left"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[10px] text-gray-500 block mt-1 text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4  bg-white flex items-center gap-2 rounded-b-2xl">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:border-0 text-black focus:ring-purple-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition"
          aria-label="Send message"
        >
          <IoIosSend  className="w-5 h-5 transform "/>
        </button>
      </div>
    </div>
    </div>
    </>
  );
};

export default ChatbotPage;
