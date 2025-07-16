import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef } from "react";
import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useChannelId } from "@/hooks/use-channel-id";
import {useworkspaceId} from "@/hooks/use-workspace-id";
import { useState } from "react";
import { toast } from "sonner";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { Id } from "../../../../../../convex/_generated/dataModel";
const Editor=dynamic(()=>import("@/components/editor"),{ssr:false});
interface ChatInputProps{
    placeholder:string;
};
type CreateMessageValues={
    channelId:Id<"channels">;
    workspaceId:Id<"workspaces">;
    body:string;
    image?:Id<"_storage">|undefined;
}
export const ChatInput = ({placeholder}:ChatInputProps) => {
    const editorRef=useRef<Quill|null>(null);
    const [editorKey,setEditorKey] = useState(0); 
    const [pending,setIsPending]= useState(false);
    const channelId= useChannelId();
    const workspaceId=useworkspaceId();
    const {mutate:generateUploadUrl} = useGenerateUploadUrl();
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
            editorRef?.current?.enable(false);
            const values:CreateMessageValues={
                channelId,
                workspaceId,
                body,
                image:undefined,
            };
            if(image){
                const url=await generateUploadUrl({},{throwError:true});

                if(!url) throw new Error("Url Not Found");
                const result=await fetch(url,{
                    method:"POST",
                    headers:{"Content-Type":image.type},
                    body:image
                });
                if(!result.ok){
                    throw new Error("Failed to upload image");
                }
                const {storageId}=await result.json();
                values.image=storageId;
            }
            await createMessage(values,{throwError:true})
        setEditorKey((prevKey) => prevKey + 1);
       } 
       catch(error)
       { 
            toast.error("Failed to send message. Please try again.");
       }
       finally{
        setIsPending(false);
        editorRef?.current?.enable(true);

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