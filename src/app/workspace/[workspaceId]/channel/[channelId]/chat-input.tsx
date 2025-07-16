import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef } from "react";
import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useChannelId } from "@/hooks/use-channel-id";
import {useworkspaceId} from "@/hooks/use-workspace-id";
import { useState } from "react";
import { toast } from "sonner";
const Editor=dynamic(()=>import("@/components/editor"),{ssr:false});
interface ChatInputProps{
    placeholder:string;
};
export const ChatInput = ({placeholder}:ChatInputProps) => {
    const editorRef=useRef<Quill|null>(null);
    const [editorKey,setEditorKey] = useState(0); 
    const [pending,setIsPending]= useState(false);
    const channelId= useChannelId();
    const workspaceId=useworkspaceId();
    const {mutate:createMessage}=useCreateMessage();
    const handleSubmit=async({
        body,
        image,

    }:{
        body:string;
        image:File|null;
    })=>{
       try{
            setIsPending(true);
            await createMessage({
            workspaceId,
            channelId,
            body,
        },{throwError:true})
        setEditorKey((prevKey) => prevKey + 1);
       } 
       catch(error)
       { 
            toast.error("Failed to send message. Please try again.");
       }
       finally{
        setIsPending(false);
       }
        // Reset the editor
    }

    return (
        <div className="px-5 w-full">
            <Editor 
                // variant="update"
                key={editorKey} // Reset editor on submit
                placeholder={placeholder}
                onSubmit={handleSubmit}
                disabled={pending}
                innerRef={editorRef}
                
            />
        </div>
    );
};