import Quill from "quill";
import {useEffect, useRef,useState} from "react";
import { useworkspaceId } from "@/hooks/use-workspace-id";
import { Button } from "./ui/button";
import { Video } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import Link from "next/link";

interface RendererProps {
    value: string;
    callId?: Id<"calls">;
    workspaceId?: Id<"workspaces">;
    callStatus?: string;
}

const Renderer = ({ value, callId, workspaceId, callStatus }: RendererProps) => {
    const [isEmpty, setIsEmpty] = useState(false);
    const [callData, setCallData] = useState<{ callId: string; joinCode: string; userName: string } | null>(null);
    const rendererRef = useRef<HTMLDivElement>(null);  

    useEffect(() => {
        if (!rendererRef.current) {
            return;
        }
        const conatainer = rendererRef.current;
        
        let parsed: unknown;
        let isCallMessage = false;
        
        try {
            parsed = JSON.parse(value);
            if (parsed && typeof parsed === 'object' && (parsed as { type?: string }).type === 'call') {
                isCallMessage = true;
                setCallData(parsed as { callId: string; joinCode: string; userName: string });
            }
        } catch (e) {
            // Not JSON, it's plain text
        }
        
        if (isCallMessage) {
            setIsEmpty(false);
            return;
        }
        
        // Try parsing as Quill delta
        let isPlainText = false;
        let contents;
        
        try {
            contents = parsed || JSON.parse(value);
        } catch (e) {
            isPlainText = true;
        }
        
        if (isPlainText) {
            conatainer.innerHTML = value;
            const isEmpty = value.trim().length === 0;
            setIsEmpty(isEmpty);
            return;
        }
        
        const quill = new Quill(document.createElement("div"), {
            theme: "snow",
        });
        quill.enable(false);
        quill.setContents(contents);
        const isEmpty = quill.getText().replace(/<(.|\n)*?>/g,"").trim().length==0;
        setIsEmpty(isEmpty);
        conatainer.innerHTML = quill.root.innerHTML;
        return () => {
            if(conatainer)
            {
                conatainer.innerHTML="";
            }
        };

    }, [value]);
    if(isEmpty) return null;
    
    if (callData && workspaceId) {
        const isCallEnded = callStatus === "ended";
        return (
            <div className="flex flex-col gap-2 p-2 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                    <Video className="size-5 text-red-500" />
                    <span className="font-medium">{callData.userName} started a Video Call</span>
                    {isCallEnded && <span className="text-xs text-muted-foreground">(Ended)</span>}
                </div>
                <Link href={`/workspace/${workspaceId}/call/${callData.callId}`}>
                    <Button 
                        variant="default" 
                        size="sm" 
                        className="mt-1"
                        disabled={isCallEnded}
                    >
                        {isCallEnded ? "Call Ended" : "Join Call"}
                    </Button>
                </Link>
            </div>
        );
    }
    
    return  <div ref={rendererRef} className="ql-editor ql-renderer" />

 
}
export default Renderer;
