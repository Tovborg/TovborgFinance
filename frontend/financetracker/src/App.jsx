import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
 // Components
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import LogoIcon from './components/LogoIcon'
// Auth
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import { useAuth } from './context/AuthContext'
import axios from 'axios'

export default function App() {
  const { user, login, logout } = useAuth();  // Grab user and save function

  return (
    <div className="">
      <Navbar />

      <main>
        <HeroSection />
      </main>
    </div>
  )
};
