// "use client";
// import {MdSend} from "react-icons/md"
// import { useEffect, useRef } from "react";
// import dynamic from "next/dynamic";
// import { Button } from "./ui/button";
// import { PiTextAa } from "react-icons/pi";
// import { ImageIcon, Smile } from "lucide-react";

// import "quill/dist/quill.snow.css";

// const Editor = () => {
//   const editorRef = useRef<HTMLDivElement>(null);
//   const quillInstance = useRef<any>(null);

//   useEffect(() => {
//     if (!editorRef.current || quillInstance.current) return;

//     import("quill").then(({ default: Quill }) => {
//       quillInstance.current = new Quill(editorRef.current!, {
//         theme: "snow",
//       });
//     });

//     return () => {
//       quillInstance.current = null;
//     };
//   }, []);

//   return (
//     <div className="flex flex-col">
//       <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white">
        
//         {/* ONLY ONE Editor Container */}
//         <div ref={editorRef} className="h-40 ql-custom" />

//         {/* Your Custom Toolbar */}
//         <div className="flex px-2 pb-2 z-[5]">
//           <Button size="iconSm" variant="ghost">
//             <PiTextAa className="size-4" />
//           </Button>
//           <Button size="iconSm" variant="ghost">
//             <Smile className="size-4" />
//           </Button>
//           <Button size="iconSm" variant="ghost">
//             <ImageIcon className="size-4" />
//           </Button>
//           <Button>
//             <MdSend/>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Editor;

import {Delta,Op} from "quill/core";
import Quill, { type QuillOptions } from "quill";
import {MdSend} from "react-icons/md"
import "quill/dist/quill.snow.css";
import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { PiTextAa } from "react-icons/pi";
import { ImageIcon, Smile ,XIcon} from "lucide-react";
import { Hint } from "./hint";
import { cn } from "@/lib/utils";
import {EmojiPopover} from "./emoji-popover";
import { current } from "../../convex/members";
import Image from "next/image";


type EditorValue={
    image:File|null;
    body:string;
}
interface EditorProps{
    onSubmit:({image,body}:EditorValue)=>void;
    onCancel?:()=>void;
    placeholder?:string;
    defaultValue?:Delta | Op[];
    disabled?:boolean;
    innerRef?:MutableRefObject<Quill|null>;
    variant?:"create"|"update";
};
const Editor=({ onSubmit,onCancel,placeholder="Write Something.....",defaultValue=[],disabled=false,innerRef,variant="create" }:EditorProps)=>{
    const [text,setText]=useState("");
    const [image,setImage]=useState<File |null>(null);
    const [isToolbarVisible,setIsToolbarVisible]=useState(true);
    const submitRef=useRef(onSubmit);
    const placeholderRef=useRef(placeholder);
    const quillRef=useRef<Quill|null>(null);
    const defaultValueRef =useRef(defaultValue);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageElementRef = useRef<HTMLInputElement>(null);
    const disabledRef=useRef(disabled);
    useLayoutEffect(()=>{
        submitRef.current=onSubmit;
        placeholderRef.current=placeholder;
        defaultValueRef.current=defaultValue;
        disabledRef.current=disabled;
    });
    useEffect(() => {
        // const container = containerRef.current;
        if(!containerRef.current) return;

        const container = containerRef.current;
        const editorContainer=container.appendChild(
            container.ownerDocument.createElement("div"),
        );
        const options: QuillOptions={
            theme: "snow",
            placeholder:placeholderRef.current,
            modules:{
                toolbar:[
                    ["bold","italic","strike"],
                    ["link"],
                    [{list:"ordered"},{list:"bullet"}]
                ],
                keyboard:{
                    bindings:{
                        enter:{
                            key:"Enter",
                            handler:()=>{
                                const text =quill.getText();
                                const addedImage = imageElementRef.current?.files?.[0]||null;
                                const isEmpty= !addedImage && text.replace(/<(.|\n)*?>/g,"").trim().length===0;
                                if(isEmpty) return;
                                const body = JSON.stringify(quill.getContents());

                                submitRef.current?.({body,image:addedImage })
                                return;
                            } 
                        },
                        shift_enter:{
                            key:"Enter",
                            shiftKey:true,
                            handler:()=>{
                                quill.insertText(quill.getSelection()?.index||0,"\n")
                            },
                        },
                    }
                }
            }
        };
        const quill=new Quill(editorContainer, options);
        quillRef.current=quill;
        quillRef.current.focus();
        if(innerRef){
            innerRef.current=quill;
        }
        quill.setContents(defaultValueRef.current);
        setText(quill.getText());

        quill.on(Quill.events.TEXT_CHANGE,()=>{
            setText(quill.getText());
        })
        return () =>{
            quill.off(Quill.events.TEXT_CHANGE);
            if(container){
                container.innerHTML = ""; 
            }
            if(quillRef.current) quillRef.current=null;
            if(innerRef?.current) innerRef.current=null;
        };
    },[innerRef]);

    const toggleToolbar=()=>{
        setIsToolbarVisible((current)=>!current);
        const toolbarElement=containerRef.current?.querySelector(".ql-toolbar");
        if(toolbarElement){
            toolbarElement.classList.toggle("hidden");
        }
    };
    const onEmojiSelect = (emoji:any)=>{
        const quill=quillRef.current;
        quill?.insertText(quill?.getSelection()?.index||0,emoji.native);
    }
    const isEmpty=!image && text.replace(/<(.|\n)*?>/g,"").trim().length===0;

    return(
        <div className="flex flex-col">
            <input type="file" accept="image/*" ref={imageElementRef} onChange={(event)=>setImage(event.target.files![0])} className="hidden"/>
            <div className={cn("flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white ",
            disabled && "opacity-70"
            )}>
                <div ref={containerRef} className="h-full ql-custom"/> 
                {/* when we select image it should be displayed in the editor */} 
                {!!image&& (
                    <div className="p-2">
                        
                        <div className="relative size-[62px] flex items-center justify-center group/image">
                               <Hint label="Remove image" 
                               >
                                    <button onClick={()=>{
                                        setImage(null);
                                    imageElementRef.current!.value="";}}
                                    className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5  text-white size-6 z-[4] border-white items-center justify-center ">
                                        <XIcon className="size-3.5 "
                                        />

                                    </button> 
                                </Hint> 
                               
                                <Image src={URL.createObjectURL(image)} alt="Uplaoded" fill className="rounded-xl over-flow-hidden border object-cover"
                                />
                        </div>
                    </div>

                )}
                <div className="flex px-2 pb-2 z-[5]">
                    <Hint label={isToolbarVisible ? "Hide Formatting":"Show Formatting"}>
                        <Button     
                            disabled={disabled}
                            size="iconSm"
                            variant="ghost"
                            onClick={toggleToolbar}
                        >
                            <PiTextAa className="size-4"/>
                        </Button>
                    </Hint>
                    <EmojiPopover onEmojiSelect={onEmojiSelect}>
                        <Button 
                            disabled={false}
                            size="iconSm"
                            variant="ghost"
                            
                        >
                            <Smile className="size-4"/>
                        </Button>
                    </EmojiPopover>    
                    {variant==="create" &&(
                        <Hint label="Image">
                            <Button 
                                disabled={disabled}
                                size="iconSm"
                                variant="ghost"
                                onClick={() => imageElementRef.current?.click()}
                            >
                                <ImageIcon className="size-4"/>
                            </Button>
                        </Hint>    
                    )}
                    {variant==="update" &&(
                        <div className="ml-auto flex items-center gap-x-2">
                            <Button
                             variant="outline"
                             size="sm"
                              onClick={onCancel}
                             disabled={disabled}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={disabled || isEmpty}
                                onClick={()=>{
                                    onSubmit({
                                        body:JSON.stringify(quillRef.current?.getContents()),
                                        image,

                                    })
                                }}
                                size="sm"
                                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                            >
                                Save
                            </Button>
                        </div>    
                    )}
                    {variant==="create" && (
                        <Button disabled={disabled||isEmpty}
                           
                            
                            onClick={()=>{
                                    onSubmit({
                                        body:JSON.stringify(quillRef.current?.getContents()),
                                        image,
                                        
                                    })
                                }}
                                 size="iconSm"
                                 className={cn(
                                "ml-auto",
                                isEmpty
                                 ? "bg-white hover:bg-white text-muted-foreground"
                                 : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                                )}
                           
                            
                        >
                            <MdSend className="size-4"/>
                        </Button>
                    )}    
                </div>
            </div>
            {variant==="create" && (<div className={cn("p-2 text-[10px] text-muted-foreground flex justify-end opacity-0 transition",!isEmpty && "opacity-100")}>
                <p>
                    <strong>Shift + Return</strong> to add a new Line
                </p>
            </div>)}
            
        </div>
    );

};
export default Editor; 
// "use client";

// import { useEffect, useRef } from "react";
// import "quill/dist/quill.snow.css";

// const Editor = () => {
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     // Dynamically import Quill only on client side
//     import("quill").then(({ default: Quill }) => {
//       const container = containerRef.current!;
//       const editorContainer = container.appendChild(
//         container.ownerDocument.createElement("div")
//       );

//       const quill = new Quill(editorContainer, {
//         theme: "snow",
//       });

//       return () => {
//         if (container) {
//           container.innerHTML = "";
//         }
//       };
//     });
//   }, []);

//   return (
//     <div className="flex flex-col">
//       <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white">
//         <div ref={containerRef} className="h-full ql-custom" />
//       </div>
//     </div>
//   );
// };

// export default Editor;
