import React, { useState, useEffect, useRef } from "react";
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { IoIosSend } from "react-icons/io";
import axios from 'axios';
import Header from './Header';
import { useLocation, useNavigate } from "react-router-dom";
import {motion} from "framer-motion";


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
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login',{ state: { from: location.pathname } });
        }
  })

  useEffect(() => {
    const fetchUserData = async () => {
      
        const token = localStorage.getItem('token');

      try {  
        const response = await axios.get('https://safespace-backend-6him.onrender.com/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setUser(response.data);
      } catch (err) {
        console.error(err);
        navigate('/login', { state: { from: location.pathname } });
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

    const response = await axios.post("https://safespace-chat.onrender.com/chat", {
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
    <div className="min-h-screen w-full bg- relative">
  {/* Noise Texture (Darker Dots) Background */}
  <div className="absolute inset-0 z-0" style={{background: "#ffffff",backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",backgroundSize: "20px 20px",}}/>


    <div className="w-screen flex justify-center items-center z-50">
    <motion.div animate={{opacity:[0, 1]}} transition={{duration: 1}} className=' md:w-[90%] fixed z-50 top-0 lg:w-[60%] z-50'>
          <Header className="z-50"/>
      </motion.div>
    </div>
    <div className="md:px-20 z-50 bg-blue-500 flex md:flex-col justify-center min-w-screen min-h-screen items-center bg-[url('/images/bg.jpg')] ">
    
    <motion.div className="flex z-50 bg-purple-400/40 p-5 font-inter gap-5 md:w-5xl shadow-2xl rounded-2xl shrink-0">
      {/* Header */}

    <div className="h-[60vh] shrink-0 flex flex-col w-[70%]">
      <div className="flex items-center gap-3 px-6 py-4 bg-[#BBADFF] text-white shadow-md rounded-t-xl shrink-0">
        <img src = "/images/therapist.jpg" className="h-10 w-10 rounded-full"></img>
        <h1 className="text-lg font-semibold text-gray-900">Solace - Your Personalised Therapist</h1>
        <span className="ml-auto text-sm bg-green-500 px-2 py-1 rounded-full">Online</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-purple-100">
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
    <div className="h-[60vh] bg-purple-100 flex flex-col w-[30%] gap-5 rounded-2xl p-5">
      <h1 className="text-md font-semibold">In Case You’re Not Sure What to Say...</h1>
      <div onClick={()=>{setInput("I am not feeling well today.")}} className="bg-white p-2 rounded-sm text-sm shadow-lg shadow-gray-300 active:bg-gray-100 hover:shadow-xl"> - "I am not feeling well today."</div>
      <div onClick={()=>{setInput("Can we talk about my overthinking?")}} className="bg-white p-2 rounded-sm text-sm shadow-lg shadow-gray-300">- "Can we talk about my overthinking?"</div>
      <div onClick={()=>{setInput("I’m not sure what’s wrong, but I need to vent.")}} className="bg-white p-2 rounded-sm text-sm shadow-lg shadow-gray-300"> - "I’m not sure what’s wrong, but I need to vent."</div>
    </div> 
    </motion.div>
    </div>
    </div>
    </>
  );
};

export default ChatbotPage;
