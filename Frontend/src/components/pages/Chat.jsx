import {React, useState} from 'react';
import Header from '../Header';
import {motion} from "framer-motion"


// Therapist List Item
const TherapistListItem = ({ name, specialty, isSelected, onSelect }) => {
  return (
    <div
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
        isSelected ? 'bg-purple-100 text-purple-700 font-semibold' : 'hover:bg-gray-100 text-gray-800'
      }`}
      onClick={onSelect}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
        {/* Placeholder for avatar/initials. You can replace with image or more sophisticated icon */}
        <span className="text-xl font-medium text-purple-600">{name.charAt(0)}</span>
      </div>
      <div>
        <p className="text-sm">{name}</p>
        <p className="text-xs text-gray-500">{specialty}</p>
      </div>
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message, time, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
          isUser ? 'bg-blue-500 text-white text-2xl ml-8' : 'bg-gray-200 text-gray-700 mr-8 text-2xl'
        }`}
      >
        <p className="text-sm">{message}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'} text-right`}>{time}</p>
      </div>
    </div>
  );
};

const Chat = () => {
 const [selectedTherapist, setSelectedTherapist] = useState('Dr. Riley'); // Default selected

  const therapists = [
    { id: 'emma', name: 'Dr. Emma', specialty: 'Empathetic Support' },
    { id: 'alex', name: 'Dr. Alex', specialty: 'Cognitive Behavioral Therapy' },
    { id: 'zen', name: 'Dr. Zen', specialty: 'Mindfulness & Meditation' },
    { id: 'riley', name: 'Dr. Riley', specialty: 'General Counseling' },
  ];

  // Example chat messages
  const messages = [
    {
      id: 1,
      sender: 'Dr. Riley',
      message: "Hello! I'm Dr. Riley, your general counseling companion. I'm here to support you with whatever you're going through. What would you like to talk about today?",
      time: '03:58 PM',
      isUser: false,
    },
    {
      id: 2,
      sender: 'User',
      message: 'hi',
      time: '04:07 PM',
      isUser: true,
    },
    {
      id: 3,
      sender: 'Dr. Riley',
      message: 'Thank you for sharing that with me. I can sense this is important to you. Can you tell me more about how this makes you feel?',
      time: '04:07 PM',
      isUser: false,
    },
    {
      id: 4,
      sender: 'User',
      message: 'hru',
      time: '04:07 PM',
      isUser: true,
    },
    {
      id: 5,
      sender: 'Dr. Riley',
      message: 'Thank you for sharing that with me. I can sense this is important to you. Can you tell me more about how this makes you feel?',
      time: '04:07 PM',
      isUser: false,
    },
    // Add more messages here
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br items-center w-screen justify-center from-white to-white flex flex-col">
     <motion.div animate={{opacity:[0, 1]}} transition={{duration: 1}} className='lg:w-[60%] md:w-[90%] fixed z-50 top-0'>
          <Header/>
      </motion.div>


        {/* Sidebar */}

        <motion.div animate={{opacity:[0,1]}} transition={{duration:1}} className='flex p-2 rounded-2xl mt-30 border-2 pl-6 border-gray-300  h-[90%]  bg-purple-200/40 shadow-lg backdrop-blur-2xl my-7 w-[80%]'>
        <aside className="w-64 p-4 mb-4 rounded-lg bg-white z-10 backdrop-blur-2xl mt-4 border-2 border-gray-300 shadow-2xl overflow-y-auto hidden md:block">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Therapist</h2>
          <div className="space-y-2">
            {therapists.map((therapist) => (
              <TherapistListItem
                key={therapist.id}
                name={therapist.name}
                specialty={therapist.specialty}
                isSelected={selectedTherapist === therapist.name}
                onSelect={() => setSelectedTherapist(therapist.name)}
              />
            ))}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col border-2 border-gray-300  rounded-lg shadow-lg m-4 overflow-hidden h-[90%]">
          {/* Chat Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white ">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                {/* Placeholder for therapist avatar */}
                <span className="text-xl font-medium text-purple-600">{selectedTherapist.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold text-purple-600">{selectedTherapist}</p>
                <p className="text-xs text-green-500">Online • Always here for you</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {/* Menu icon (three dots) */}
              <svg className="w-6 h-6 text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg.message} time={msg.time} isUser={msg.isUser} />
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white flex items-center">
            <textarea
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mr-2"
              rows="1"
              placeholder={`Message ${selectedTherapist}...`}
            ></textarea>
            <button className="bg-purple-500 hover:bg-purple-600 text-white p-3 border-2 border-gray-300 rounded-full shadow-md flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7v14"></path> {/* Example: Send icon */}
              </svg>
            </button>
          </div>
        </main>
      </motion.div>
      </div>
  )
};

export default Chat;