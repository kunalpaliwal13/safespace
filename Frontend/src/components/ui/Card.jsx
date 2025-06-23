import React from 'react'



function Card({heading, desc, icon: Icon}) {

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full font-inter hover:translate-y-[-10px]" style={{'transition': 'all 0.3s ease-in-out'}}>
      {/* Icon Circle */}
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        {/* Chat Bubbles Icon (SVG similar to image) */}
        <Icon className='text-purple-600 text-2xl'/>
        
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {heading}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 md:text-sm lg:text-lg leading-relaxed">
        {desc}
      </p>

      {/* Learn More Link */}
      <a href="#" className="text-purple-600 font-semibold hover:underline flex items-center">
        Learn More{' '}
        <span className="ml-1">»</span> {/* Simple arrow character */}
      </a>
    </div>
  );
}


export default Card