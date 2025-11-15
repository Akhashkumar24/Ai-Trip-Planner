import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <div className='flex flex-col items-center mx-56 gap-9'>
      <h1 className='font-extrabold text-[50px] text-center mt-10'><span className='text-[#3b82f6]'>AI Travel Buddy: </span>Your Perfect Travel Companion</h1>

      <p className='text-xl text-gray-500 text-center'>Plan your dream getaway with AI-powered personalized itineraries, weather insights, and detailed budget breakdowns.</p>

      <Link to={'/create-trip'}><Button>Get Started, It's free</Button></Link>

      <img src="/landing.png" alt="" className='w-[750px]' />

    </div>
  )
}

export default Hero