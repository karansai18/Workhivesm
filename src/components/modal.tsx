"use client";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import {useEffect,useState} from "react";
import { CreateChannelModal } from "@/features/channels/Components/create-channel-modal";
export const Modal=()=>{
    const [mounted,setMounted] = useState(false);
    useEffect(()=>{
        setMounted(true);
    },[]);
    if(!mounted) return null; 
    return(
        <>
            <CreateChannelModal/>
            <CreateWorkspaceModal/>
        </>
    )
}