import {useState} from "react";
import{
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { useCreateChannelModal } from "../store/use-create-channel-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateChannel } from "../api/use-create-channel";
import { useworkspaceId } from "@/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export const CreateChannelModal = ()=>{
    const router= useRouter();
    const workspaceId = useworkspaceId();
    const {mutate,isPending}= useCreateChannel();
    const [open,setOpen] = useCreateChannelModal();
    const [name,setName] = useState("");
    // const handleClose = ()=>{
        //     setOpen(false);
        // };
        const handleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
            const value = e.target.value.replace(/\s+/g,"-").toLowerCase();
            setName(value);
        }
        const handleClose=()=>{
            setName("");
            setOpen(false);
        };
        const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
            e.preventDefault();
            mutate({name,workspaceId},
                {
                    onSuccess:(id)=>{
                        toast.success("Channel Created Successfully");
                        router.push(`/workspace/${workspaceId}/channel/${id}`)
                        handleClose();
                    },
                    onError:(error)=>{
                       toast.error("Failed to Create Channel");
                    }
                },
            
        );
    };
    return(
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create a channel
                    </DialogTitle>
                    <DialogDescription>
                        Channels are where you and your team communicate. They are best when organized around a topic.
                    </DialogDescription>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            value={name}
                            disabled={isPending}
                            onChange={handleChange}
                            required
                            autoFocus
                            minLength={3}
                            maxLength={80}
                            placeholder="e.g #plan-budget"
                        />
                        <div className="flex justify-end">
                            <Button disabled={false}>Create</Button>
                        </div>
                    </form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}