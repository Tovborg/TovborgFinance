import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
 // Components
import Navbar from './components/Navbar'
// Auth
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import { useAuth } from './context/AuthContext'
import axios from 'axios'

export default function App() {
  const { user, login, logout } = useAuth();  // Grab user and save function



  return (
    <div className="">
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div>
            <h2>React Google Login</h2>
            <br />
            <br />
            {user ? (
            <div>
              <img src={user.picture} alt="user image" />
              <h3>User Logged in</h3>
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              <br />
            </div>
          ) : (
            <div>
              <h3>User not logged in</h3>
              <p>Click the button below to login</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
};
