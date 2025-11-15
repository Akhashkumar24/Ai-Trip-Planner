import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import axios from 'axios';

function Header() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    console.log(user)
  })

  const login = useGoogleLogin({
    onSuccess: (res) => GetUserProfile(res),
    onError: (error) => console.log(error)
  })

  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo.access_token}`,
        Accept: 'application/json',
      },
    }).then((resp) => {
      console.log(resp);
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false);
      window.location.reload();
    }).catch((error) => {
      console.error("Error fetching user profile: ", error);
    });
  }

  return (
    <div className='bg-white shadow-lg border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center space-x-2'>
          <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-xl'>✈️</span>
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>AI Travel Buddy</h1>
            <p className='text-xs text-gray-500'>Your Perfect Travel Companion</p>
          </div>
        </div>
        
        <div>
          {user ?
            <div className='flex items-center gap-4'>
              <a href="/create-trip">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md">
                  ✨ Create Trip
                </Button>
              </a>
              <a href="/my-trips">
                <Button variant="outline" className="border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50">
                  My Trips
                </Button>
              </a>
              <Popover>
                <PopoverTrigger>             
                  <img src={user?.picture} alt="" className='h-10 w-10 rounded-full border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition-colors' />
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="p-2">
                    <div className="text-sm font-medium text-gray-800 mb-1">{user?.name}</div>
                    <div className="text-xs text-gray-500 mb-3">{user?.email}</div>
                    <Button
                      variant="outline" 
                      size="sm" 
                      className='w-full text-red-600 border-red-200 hover:bg-red-50' 
                      onClick={()=>{
                        googleLogout();
                        localStorage.clear();
                        window.location.reload();
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div> : 
            <Button 
              onClick={()=>setOpenDialog(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md"
            >
              Sign In
            </Button>
          }
        </div>

        <Dialog open={openDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogDescription>
                <div className="text-center space-y-4">
                  <div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto'>
                    <span className='text-white font-bold text-2xl'>✈️</span>
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-800'>Welcome to AI Travel Buddy!</h2>
                    <p className='text-gray-600 mt-2'>Sign in to save and access your personalized travel plans</p>
                  </div>
                  <Button
                    onClick={login}
                    className="w-full mt-6 flex gap-4 items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl">
                    <FcGoogle className="h-6 w-6" />
                    Continue with Google
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Header