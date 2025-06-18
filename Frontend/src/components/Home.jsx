// HomeLandingPage.jsx
import React, {useEffect, useState} from "react";
import { HiOutlineArrowSmDown } from "react-icons/hi";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { IoMailOutline } from "react-icons/io5";
import { IoCallOutline } from "react-icons/io5"
import { LuMapPin } from "react-icons/lu";
import { Link } from "react-router-dom";
import { IoChatboxEllipsesSharp } from "react-icons/io5";
import { PiGearSixFill } from "react-icons/pi";
import { FaTools } from "react-icons/fa";
import axios from 'axios';
import Header from "./Header";
import Footer from "./Footer";
import { Link as ScrollLink } from 'react-scroll';
import emailjs from 'emailjs-com';



const HomeLandingPage = () => {
  const [User, setUser] = useState(null);
  
  const services = [
    {
      title: "AI-Powered Therapy",
      description: "Real-time, anonymous mental health support through AI-based therapists. SafeSpace connects users to tailored therapy sessions, offering emotional guidance and assistance anytime.",
      icon: "IoChatboxEllipsesSharp"
    },
    {
      title: "Sentiment Analysis Engine",
      description: "A machine learning-powered sentiment analysis tool that monitors user chats and journal entries to flag severe emotional distress and offer personalized, mood-based suggestions.",
      icon: "PiGearSixFill"
    },
    {
      title: "Mood Tracking & Tools",
      description: "Track your emotional well-being with a personalized mood journal and access calming tools like guided breathing exercises and soundscapes to help manage stress.",
      icon: "FaTools"
    }
  ];
  
  const sendEmail =(e)=>{
    e.preventDefault();
    emailjs.sendForm( import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      e.target,
      import.meta.env.VITE_EMAILJS_USER_ID )
    .then((result) => {
      console.log(result.text);
      alert('Message sent!');
    }, (error) => {
      console.log(error.text);
      alert('Failed to send message.'+ error);
    });
    e.target.reset();
  }
  
  const getIcon =(icon)=>{
    switch(icon){
      case "IoChatboxEllipsesSharp":{
        return <IoChatboxEllipsesSharp/>;
      }
      case "PiGearSixFill":{
        return <PiGearSixFill/>;
      }
      case "FaTools": {
        return <FaTools/>
      }
    }
  }

  useEffect(() => {
    
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,  
        }}
      );
      
        setUser(response.data);  
        } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();

  }, [User]);
  

  const HandleLogout=()=>{
    localStorage.removeItem("token");
    window.location.href = "/login";
  }


  return (
    <div className="poppins text-gray-800 bg-white w-screen m-0 p-0 overflow-x-hidden scrollbar-thin">
      {/* Header */}
      <Header/>
      

      {/* Hero Section */}
      <section id="home" className="flex flex-col md:flex-row items-center bg-[url('/images/bg.jpg')] w-screen gap-45 h-[50vh] md:h-[90vh] justify-center">
        <div className="md:w-200 space-y-6 ml-5 md:ml-14 mr-10  mt-50 md:mt-0">
          <h1 className="text-2xl md:text-5xl font-bold text-purple-900 md:text-left shadow-white">Understanding and Improving Mental Health</h1>
          <p className="text-base md:text-xl text-gray-600 md:text-left">SafeSpace connects you with AI therapists for anonymous, real-time support. Track your emotional well-being and access personalized tools for better mental health.</p>
          <div className=" flex-col md:flex md:flex-row gap-10 justify-center center">
          <button className="bg-gradient-to-r from-[#8c4dcf] to-[#c742d3] text-white px-6 py-3 rounded-full  transition hover:from-[#a10eaf] hover:to-[#762ac7]">
            <Link to= {User? "/chatbot": "/login"}> Talk to our AI therapist </Link>
          </button>
          <ScrollLink to="services" smooth={true} duration={500} offset={-70} className=" text-black px-6 py-3  md:border border-gray-300 bg-transparent md:bg-[#ffffffac] w-50 rounded-full transition hover:bg-gray-200">
            <div className="flex center justify-center ">Learn More <HiOutlineArrowSmDown className="flex center justify-center mt-1.25 ml-1"/></div>
          </ScrollLink>
          </div>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0 mr-30">
        <img src="/images/therapy-home.jpg" alt="Mental health support" className="hidden md:block w-full rounded-lg" />
          </div>
      </section>

      {/* Services Section */}
      <section className="  md:px-25 py-10  bg-gray-100 shadow-[0_-8px_20px_0_rgba(255,255,255,0.6)]" id="services">
        <h2 className="text-3xl md:text-4xl font-semibold text-purple-800 ">Our Services</h2>
        <p className="mb-10 mt-5 text-gray-500 px-10 md:px-0">SafeSpace offers a range of mental health support services, powered by advanced AI technology and guided by professional therapists.</p>
        <div className="block md:flex center justify-center gap-6 md:grid-cols-3 mr-12 md:mx-20">

        {services.map((service, index) => (
             <div key={index} className="bg-white md:ml-0 ml-10 p-6 rounded-3xl shadow-md hover:shadow-xl transition-shadow mb-10 md:mb-0">
              <div className="flex justify-around items-start flex-col">
               <div className="bg-purple-200 h-20 w-20 rounded-full text-3xl flex justify-center items-center mb-4 text-purple-800">{getIcon(service.icon)}</div>
              <h3 className="text-xl font-semibold text-black mb-4">{service.title}</h3>
              </div>
             
             <p className="text-gray-600 mb-4 text-left text-base">{service.description}</p>
             <div className="flex justify-items-start">
              <div className="flex">
             <a href="#learn-more" className="text-purple-600 flex hover:underline text-left">Learn More <MdOutlineKeyboardDoubleArrowRight className="h-6.5 ml-1"/></a>
             </div>
             </div>
           </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="md:px-6 px-15 md:py-16 py-5  bg-white text-center">
        
        <div className="flex">
          <img src = "/images/tree.png" className= "h-[550px] ml-40 mr-20 rounded-2xl hidden md:block"></img>
          <div className="flex flex-col w-5xl justify-center">
            <h2 className="text-2xl md:text-4xl font-semibold text-purple-900 mb-4 mr-2 md:mr-0 ">Committed to Your Mental Well-being</h2>
            <p className="text-gray-600  md:mx-25 mb-6 text-left text-lg">At SafeSpace, we believe that mental well-being is a fundamental right, not a privilege. Everyone deserves access to compassionate, reliable, and professional mental health support—anytime, anywhere. That's why we've built a platform that merges cutting-edge AI technology with evidence-based therapeutic methods, making emotional support more accessible than ever before.<br/><br/>
            Our AI-powered therapists are designed to engage in meaningful conversations using principles drawn from Cognitive Behavioral Therapy (CBT), Mindfulness, and Positive Psychology. These virtual companions provide a safe, judgment-free environment where users can share their feelings, reflect on their thoughts, and receive empathetic responses and actionable coping strategies.<br/><br/>
            But SafeSpace goes beyond just conversation. Through real-time sentiment analysis, we monitor journal entries and chats to proactively identify emotional distress, offering timely, personalized suggestions. From guided breathing sessions and calming soundscapes to mood tracking tools, every feature is built to empower users in their self-care journey.
            </p>



          </div>
        </div>
        

      </section>

      {/* Statistics Section */}
      <section className=" px-15 md:px-6 py-16 bg-[#f4f0fa] flex flex-col md:flex-col justify-around items-center text-center gap-5">
      <p className="text-lg text-gray-500 italic">We’re currently onboarding our first users. Want to be part of the journey?</p>
        <a href="#contact" className="mt-2 inline-block bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800">
          Join our beta program
        </a>
      </section>

      
       

      {/* Testimonials Section */}
      <section className="md:px-6  px-15 py-16 bg-white text-center" id="testimonials">
        <h2 className="text-2xl md:mr-0 mr-5 md:text-3xl font-semibold text-purple-800 mb-8">What Our Clients Say</h2>
        <div className="space-y-8 max-w-2xl mx-auto">
          <blockquote className="italic text-gray-700">“The exercises have helped me manage my stress alot!” — Rishabh Sharma (Early beta user)</blockquote>
          <blockquote className="italic text-gray-700">“Helped me deal with my consistent anxiety.” — Disha Jalan (Early beta user)</blockquote>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className=" md:px-6 py-16 bg-white text-center flex justify-center center ">
        <div className=" py-5 px-10  md:px-18 md:w-1/2">
          <div className="bg-white rounded-xl py-8 shadow-2xl px-10">
          <h2 className="text-3xl font-semibold text-purple-800 mb-6">Contact Us</h2>

          <form className="space-y-4 md:max-w-xl" onSubmit={sendEmail}>
            <input type="text" placeholder="Your Name" className="w-full p-2 rounded-sm border border-gray-300" required name="name" />
            <input type="email" placeholder="Your Email" className="w-full p-3 rounded border border-gray-300" required name="email"/>
            <textarea placeholder="Your Message" className="w-full p-3 rounded border border-gray-300" rows="5" required name="message"></textarea>
            <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition">Send Message</button>
          </form>

          </div>
        </div>
        <div className="w-1/2  py-9 justify-items-start hidden md:flex ">
          <div className="flex flex-col  items-start w-[70%] ">
            <h2 className="text-black font-semibold text-lg left">Get in touch</h2>
            <p className="text-left">We're here to answer your questions and provide support. Reach out to us through any of these channels.</p>

            <div className="h-10 text-2xl mt-4 flex">
              <IoMailOutline className="text-purple-800 mr-5"/>
              <div className="flex flex-col justify-items-start items-start">
                <p className="text-base">Email Us</p>
                <p className= "text-sm">support@safespace-app.com</p>
              </div>
            </div>
            <div className="h-10 text-2xl mt-4 flex">
              <IoCallOutline className="text-purple-800 mr-5"/>
              <div className="flex flex-col justify-items-start items-start">
                <p className="text-base">Call Us</p>
                <p className= "text-sm">+91 1234567890</p>
              </div>
            </div>
            <div className="h-10 text-2xl mt-4 flex">
              <LuMapPin className="text-purple-800 mr-5"/>
              <div className="flex flex-col justify-items-start items-start">
                <p className="text-base">Call Us</p>
                <p className= "text-sm">404-xyz apartment, Bangalore</p>
              </div>
            </div>
            
          </div>  

          </div>
        
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default HomeLandingPage;
