import React from 'react'
import VantaBackground from "./VantaBackground"
import Header from './Header'
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";


function Hero() {
  return (
    <div className='h-screen w-screen flex flex-col items-center bg-[#fdfbfe]'>
    
    <div className='w-[70%]'>
        <Header/>
    </div>
    
    <div id='herosec' className='px-100 flex flex-col items-center'>

        <h1 className='text-gray-700 mt-10 text-[60px] font-semibold text-center leading-18'>Mental Health Support,<br/> <span className='text-[60px]'>anytime You Need It</span></h1>
        <p className='text-gray-700 text-[18px] mt-10 text-center'>Access calming tools, connect with our AI companion for supportive conversations, and explore guided exercises designed to ease stress, boost your mood, and help you feel more in control one step at a time.</p>
        
        <div className='flex gap-6 mt-10'>
        <Button className="group bg-purple-700 hover:bg-purple-500 p-5 text-base">
            Let's start<ArrowRight className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5" size={16} strokeWidth={2} aria-hidden="true"/>
        </Button>
         <Button variant="outline" className='p-5 text-base'>
            Learn More
         </Button>
         </div>
    </div>



    
    </div>
  )
}

export default Hero