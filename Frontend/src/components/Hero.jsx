import React from 'react'
import Header from './Header'
import { Button } from "@/components/ui/button";
import { ArrowRight, AudioLines, MessageSquareQuote, Settings } from "lucide-react";
import { motion, useScroll, useTransform } from 'framer-motion';
import Card from './ui/Card';



function Hero() {
  const { scrollYProgress } = useScroll(); 
  const scale = useTransform(scrollYProgress, [0,1], [1, 0.9]);

  const cardItems=[
    {'heading': 'AI-Powered Therapy', 'desc': 'Real-time, anonymous mental health support through AI-based therapists. SafeSpace connects users to tailored therapy sessions, offering emotional guidance and assistance anytime.', 'icon': MessageSquareQuote},
    {'heading': 'Sentiment Analysis Engine', 'desc': 'A machine learning-powered sentiment analysis tool that monitors user chats and journal entries to flag severe emotional distress and offer personalized, mood-based suggestions.', 'icon': Settings },
    {'heading': 'Mood Tracking & Tools', 'desc': 'Track your emotional well-being with a personalized mood journal and access calming tools like guided breathing exercises and soundscapes to help manage stress.','icon': AudioLines},
    
  ]

  return (
    <div className='h-screen w-screen flex flex-col items-center bg-[#fdfbfe]'>

    
      {/* progress-bar */}
      <motion.div className='w-full bg-purple-400 h-2 fixed top-0 origin-left z-50' style={{ scaleX: scrollYProgress }}/>
      
      {/* header      */}
      <motion.div animate={{opacity:[0, 1]}} transition={{duration: 1}} className='w-[60%] fixed z-50 top-0'>
          <Header/>
      </motion.div>
      
      {/* main hero section  */}
      <motion.div style={{ scale }} className='fixed top-30'>
        <motion.div animate={{opacity:[0, 1], y:[30,0]}} transition={{duration: 2}} id='herosec' className=' px-100 flex flex-col mb-20 items-center'>

            <h1 className='text-gray-900 mt-10 text-[60px] font-semibold text-center leading-18'>Mental Health Support,<br/> <span className='text-[60px]'>anytime You Need It</span></h1>
            <p className='text-gray-900 text-[18px] mt-10 text-center'>Access calming tools, connect with our AI companion for supportive conversations, and explore guided exercises designed to ease stress, boost your mood, and help you feel more in control one step at a time.</p>

            <div className='flex gap-6 mt-10'>
            <Button onClick={{}} className="group bg-purple-700 hover:bg-purple-500 p-5 text-base font-semibold rounded-lg">
                <a href='chatbot'>Let's start</a><ArrowRight className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5" size={16} strokeWidth={2} aria-hidden="true"/>
            </Button>
             <Button variant="outline" className='p-5 text-base font-semibold text-gray-700'>
                Learn More
             </Button>
             </div>
        </motion.div>
      </motion.div>


    {/* our-services  */}
    <div id="our-services" className='px-100 bg-[#fdfbfe] flex justify-center w-full mt-20 rounded-3xl relative top-120'>
      

      <div className=' w-full flex py-10 flex-col items-center'>
        
        <motion.h1 animate={{opacity : [0,1], y:[30,0]}} transition={{duration: 2}} className='text-purple-600 text-4xl mb-10 font-semibold'> Our Services </motion.h1>

        {/* cards  */}
        <motion.div animate={{opacity : [0,1], y:[30,0]}} transition={{duration: 2}} className='flex gap-10'>
          {cardItems.map((item, index)=>(
            <Card  key={index} heading={item.heading} desc={item.desc} icon={item.icon}/>
         ))}
        </motion.div>

      </div>
    </div>


    <div className='px-100 bg-[#fdfbfe] flex flex-col justify-center items-center w-full mt-20 rounded-3xl relative top-100 pt-20 rounded-t-3xl'>
     <motion.div className='text-3xl text-gray-900 font-bold px-40'  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeInOut" }} viewport={{ once: true, amount: 0.5 }}>
        “SafeSpace makes me feel heard, even on my hardest days. The support feels personal and real.”
      </motion.div>
      <motion.div className='flex items-center my-10 text-gray-700 text-lg font-bold' initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeInOut" }} viewport={{ once: true, amount: 0.5 }}>
        -Anonymous
      </motion.div>
    </div>

    <div className=' relative top-100 w-full px-100'>
      <div className='h-0.5 w-full relative bg-gray-200 mb-5'></div>
    </div>


    

   



    
    </div>
  )
}

export default Hero