import React, { useEffect } from 'react'
import Header from '../Header'
import { Button } from "@/components/ui/button";
import { ArrowRight, AudioLines, MessageSquareQuote, Settings } from "lucide-react";
import { motion, useScroll, useTransform } from 'framer-motion';
import Card from '../ui/Card';
import { useNavigate } from 'react-router-dom';
import {Contact7} from "../ui/Contact"



function Hero() {
  const { scrollYProgress } = useScroll(); 
  const scale = useTransform(scrollYProgress, [0,1], [1, 0.9]);
  const navigate = useNavigate();

  const cardItems=[
    {'heading': 'AI-Powered Therapy', 'desc': 'Real-time, anonymous mental health support through AI-based therapists. SafeSpace connects users to tailored therapy sessions, offering emotional guidance and assistance anytime.', 'icon': MessageSquareQuote},
    {'heading': 'Sentiment Analysis Engine', 'desc': 'A machine learning-powered sentiment analysis tool that monitors user chats and journal entries to flag severe emotional distress and offer personalized, mood-based suggestions.', 'icon': Settings },
    {'heading': 'Mood Tracking & Tools', 'desc': 'Track your emotional well-being with a personalized mood journal and access calming tools like guided breathing exercises and soundscapes to help manage stress.','icon': AudioLines},
    
  ]


  const getChat = () => {
      navigate('/chatbot');
  };

  return (
    <div className='h-screen w-screen flex flex-col items-center bg-white relative lg:overflow-x-visible md:overflow-visible overflow-x-hidden'>
      
      <motion.div className='w-full bg-purple-400 h-2 md:fixed lg:fixed absolute top-0 origin-left z-50' style={{ scaleX: scrollYProgress }}/>
      
      {/* header      */}
      <motion.div animate={{opacity:[0, 1]}} transition={{duration: 1}} className='lg:w-[60%] md:w-[90%] fixed z-50 top-0 w-full'>
          <Header/>
      </motion.div>
      
      {/* main hero section  */}
      <motion.div style={{ scale }} className='lg:fixed md:fixed absolute md:top-30 top-25 lg:top-30 '>
        <motion.div animate={{opacity:[0, 1], y:[30,0]}} transition={{duration: 2}} id='herosec' className=' lg:px-100 md:px-30 flex flex-col lg:mb-20 md:mb-20 items-center '>

            <h1 className='text-gray-900 lg:mt-10 md:text-[40px] lg:text-[60px] text-[32px] font-semibold text-center lg:leading-18 md:leading-18 md:mt-10'>Mental Health Support,<br/> <span className='md:text-[40px] lg:text-[60px]'>anytime You Need It</span></h1>
            <p className='text-gray-900 md:text-[18px] lg:text-[18px] mt-10 text-center px-5'>Access calming tools, connect with our AI companion for supportive conversations, and explore guided exercises designed to ease stress, boost your mood, and help you feel more in control one step at a time.</p>

            <div className='flex gap-6 mt-10'>
            <Button onClick={getChat} className="group bg-purple-700 hover:bg-purple-500 p-5 text-base font-semibold rounded-lg">
                Chat Now<ArrowRight className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5" size={16} strokeWidth={2} aria-hidden="true"/>
            </Button>
             <Button variant="outline" className='p-5 text-base font-semibold text-gray-700'>
                Learn More
             </Button>
             </div>
        </motion.div>
      </motion.div>


    {/* our-services  */}
    <div id="our-services" className='lg:px-[15%] md:px-[5%] bg-[#fdfbfe]  flex  justify-center w-full mt-20 rounded-3xl relative top-100 md:top-120 lg:top-120'>
      

      <div className=' w-full flex flex-col py-10 px-5 items-center'>
        
        <motion.h1 animate={{opacity : [0,1], y:[30,0]}} transition={{duration: 2}} className='text-purple-600 md:text-3xl lg:text-4xl text-3xl mb-10 font-semibold'> Our Services </motion.h1>

        {/* cards  */}
        <motion.div animate={{opacity : [0,1], y:[30,0]}} transition={{duration: 2}} className='flex lg:flex-row md:flex-row flex-col lg:gap-10 md:gap-5 gap-10'>
          {cardItems.map((item, index)=>(
            <Card  key={index} heading={item.heading} desc={item.desc} icon={item.icon}/>
         ))}
        </motion.div>

      </div>
    </div>


    <div className='lg:px-100 md:px-10 bg-[#fdfbfe] flex flex-col justify-center items-center w-full lg:mt-20 md:mt-20 rounded-3xl relative top-100 pt-20 rounded-t-3xl'>
     <motion.div className='text-3xl text-gray-900 font-bold md:px-40 lg:px-40 px-10'  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeInOut" }} viewport={{ once: true, amount: 0.5 }}>
        “SafeSpace makes me feel heard, even on my hardest days. The support feels personal and real.”
      </motion.div>
      <motion.div className='flex items-center my-10 text-gray-700 text-lg font-bold' initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeInOut" }} viewport={{ once: true, amount: 0.5 }}>
        -Anonymous
      </motion.div>
    </div>

<div id ='contact' className='mt-100 bg-white z-50'>

    <Contact7/>
</div>


    

   



    
    </div>
  )
}

export default Hero