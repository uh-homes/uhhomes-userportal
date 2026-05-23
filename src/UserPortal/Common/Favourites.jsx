import React from 'react'
import { PiHeartbeat } from 'react-icons/pi'

export default function Favourites() {
  return (
  
    <div className='w-full max-w-7xl mx-auto p-4 rounded-lg   mt-8'>
   <div className='flex items-center gap-2 '>
        <PiHeartbeat className='text-2xl text-teal-600'/> 
        <h2 className="font-semibold text-lg ">My Favourites </h2>
   </div>
    </div>
  )
}
