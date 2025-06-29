// import { Button } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import{
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code";
import { useConfirm } from "@/hooks/use-confirm";
import { useworkspaceId } from "@/hooks/use-workspace-id";
import { DialogClose } from "@radix-ui/react-dialog";
import { Copy, CopyIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface InviteModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    name:string;
    joinCode:string;
};
// import { useState } from "react";
export const InviteModal = ({open,setOpen,name,joinCode}:InviteModalProps) => {
    // const [open, setOpen] = useState(false);
    // const handleOpen = () => setOpen(true);
    // const handleClose = () => setOpen(false);
    const workspaceId = useworkspaceId();
    const [ConfirmDialog,confirm]=useConfirm(
        "Are you sure?",
        "This will generate a new invite code and generate a new one.",
    );
    const {mutate,isPending}  = useNewJoinCode();
    const handleNewCode=async()=>{
        const ok = await confirm();
        if(!ok) return;
        mutate({workspaceId},{
           onSuccess:()=>{
                toast.success("Invite code generated successfully!");
            },
            onError:(error)=>{
                toast.error("Failed to generate invite code. Please try again.");
            } 
        });
    };
    const handleCopy = () => {
        const inviteLink = `${window.location.origin}/join/${joinCode}`;
        navigator.clipboard.writeText(inviteLink).then(() =>toast.success("Invite link copied to clipboard!"));
    }    
    return (
        <>
            <ConfirmDialog/>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite People to {name}</DialogTitle>
                        <DialogDescription>
                            Use the code below to invite people to your workspace.
                        </DialogDescription>    
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center py-10">
                        <p className="text-4xl font-bold tracking-widest uppercase">
                            {joinCode}
                        </p>
                        <Button
                            onClick={handleCopy}
                            variant="ghost"
                            size={"sm"}
                        >
                            Copy link
                            <CopyIcon className="size-4 ml-2"/>
                        </Button>
                    </div>
                    <div className="flex items-center justify-between w-full">
                        <Button disabled={isPending} onClick={handleNewCode} variant={"outline"}>
                            New Code
                            <RefreshCcw className="size-4 ml-2"/>
                        </Button>
                        <DialogClose asChild>
                            <Button>Close</Button>
                        </DialogClose>

                    </div>
                </DialogContent>
            </Dialog>
        </>    
    );
}

