import React from 'react'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import Features from '../components/home/Features'
import HeroSection from '../components/home/HeroSection'


const Landing = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Features />
      <Footer />
    </>
  )
}

export default Landing