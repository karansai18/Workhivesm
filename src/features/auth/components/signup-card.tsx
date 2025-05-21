import { Button } from "@/components/ui/button";
import { Card,CardDescription,CardHeader,CardTitle,CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {FcGoogle} from 'react-icons/fc';
import { FaGithub } from "react-icons/fa";
import { SignInFlow } from "../type";
import { useState } from "react";
import {TriangleAlert} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

interface SignUpCardProps{
      setState:(state:SignInFlow)=>void;
};

export const SignUpCard = ({setState}:SignUpCardProps) => {
   const { signIn } = useAuthActions();
   const [name,setName]= useState("");
   const [email,setEmail] =  useState("");
    const [password,setPassword]=useState("");
    const [confirmpassword,setConfirmPassword]=useState("");
    const [pending,setPending]= useState(false);


    const onPasswordSignUp = (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(password !== confirmpassword)
    {
      setError("Password donot match");
      return;
    }
    setPending(true);
    signIn("password",{name,email,password, flow:"signUp"})
     .catch(()=>{
      setError("Something went wrong")
     })
     .finally(()=>{
      setPending(false);
     })
  }

    const onProviderSignUp = (value:"github" | "google")=>{
    setPending(true);
     signIn(value)
     .finally(()=>{
      setPending(false)
     })

  }
    
  const [error,setError] = useState("");
  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>
        SignUp to continue
        </CardTitle>
        <CardDescription>
        Use your email or another service to continue
      </CardDescription>
      </CardHeader>

      
      {!!error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
          <TriangleAlert className="size-4"/>
          <p>{error}</p>
          
           </div>
      )}
     
      <CardContent className="space-y-5 px-0 pb-0">
            <form onSubmit={onPasswordSignUp} className="space-y-2.5">
                <Input disabled={false} value={name} onChange={(e)=>setName (e.target.value)} placeholder="FullName" type="text" required
                />
                <Input disabled={false} value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Emaileeeee" type="email" required
                />

<Input disabled={false} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="password" type="password" required
                />

<Input disabled={false} value={confirmpassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm password" type="password" required
                />
                <Button type='submit' className="w-full" size="lg" disabled={false}>
                  Continue
                </Button>

            </form>
            <Separator />
              <div className="flex flex-col gap-y-2.5">
                  <Button disabled={false} onClick={()=>onProviderSignUp("google")} variant="outline" size="lg" className="w-full relative">
                    <FcGoogle/>
                        Continue with Google
                  </Button>
              </div>

              <div className="flex flex-col gap-y-2.5">
                  <Button disabled={false} onClick={()=>onProviderSignUp("github")} variant="outline" size="lg" className="w-full relative">
                    <FaGithub/>
                        Continue with Github
                  </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Already have an account? <span onClick={()=>setState("signIn")}className="text-sky-700 hover:underline cursor-pointer">SignIn</span>
              </p>
           

      </CardContent>
      
    </Card>
  );
};

