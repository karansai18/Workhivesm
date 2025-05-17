"use client";
import {useState} from 'react';
import { SignInFlow } from '../type';
import { SignInCard } from './signIn-card';
import { SignUpCard } from './signup-card';

export const AuthScreen=()=>{
    const [state,setState] = useState<SignInFlow>("signIn");

    return(
        <div className="h-screen flex items-center justify-center bg-[#5C3B58]">
        <div className="md:h-auto md:w-[420px]">
          {state === "signIn" ? <SignInCard setState={setState } /> : <SignUpCard setState={setState}  />}
        </div>
      </div>
      
       
    )   
}