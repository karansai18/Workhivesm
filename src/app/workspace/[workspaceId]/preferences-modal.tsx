import{
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { useRemoveWorkspace } from "@/features/workspaces/api/use-remove-workspace";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useworkspaceId } from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
interface PreferencesModalProps{
    open:boolean;
    setOpen:(open:boolean)=>void;
    initialValue:string;
}
export const PreferencesModal=({
    open,
    setOpen,
    initialValue,
}:PreferencesModalProps)=>{
    const workspaceId = useworkspaceId();
    const router = useRouter();
    const [ConfirmDialog,confirm]= useConfirm(
        "Are you sure?",
        "This action is irreversible"
    );
    // const [ConfirmEditDialog,confirmEdit]= useConfirm(
    //     "Are you sure?",
    //     "This action is irreversible"
    // );
    const [value,setValue] = useState(initialValue);    
    const [editOpen,setEditOpen]= useState(false);
    const {mutate:updateWorkspace,isPending:isUpdatingWorkspace} = useUpdateWorkspace();
    const {mutate:removeWorkspace,isPending:isRemovingWorkspace} = useRemoveWorkspace();

    const handleRemove=async()=>{
        const ok = await confirm();
        if(!ok)
        {
            return;
        }
         removeWorkspace({
            id:workspaceId
         },{
            onSuccess:()=>{
                
                toast.success("Workspace Removed");
                setEditOpen(false);
                 router.replace("/")
                // close the thing
            },
            onError:()=>{
                toast.error("Failed to Remove workspace")
            }

         })

    }
    const handleEdit=async(e:React.FormEvent<HTMLFormElement>)=>
    {
        const ok = await confirm();
        e.preventDefault();
        updateWorkspace({
            id:workspaceId,
            name:value,
        },{
            onSuccess:()=>{
               
                toast.success("Workspace updated");
                setEditOpen(false);
                // close the thing
            },
            onError:()=>{
                toast.error("Failed to update workspace")
            }

        })

    }
    return(
        <>
           <ConfirmDialog/>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {value}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-4 pb-4 flex flex-col gap-y-2">
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>

                      <DialogTrigger asChild>
                        <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">
                                        Workspace name
                                </p>
                                <p className="text-sm text-[#1264a3] hover:underline font-semibold" >
                                            Edit
                                </p>                
                            </div>
                            <p className="text-sm">
                                {value}
                            </p>
                        </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Reaneme this workspace
                                </DialogTitle>
                            </DialogHeader>
                            <form className="space-y-4" onSubmit={handleEdit}>
                                    <Input
                                    value={value}
                                    disabled={isUpdatingWorkspace}
                                    onChange={(e)=>setValue(e.target.value)}
                                    required
                                    autoFocus
                                    minLength={3}
                                    maxLength={80}
                                    placeholder="Workspace name e.g. 'Work,'Personal', 'Home'"
                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={isUpdatingWorkspace}>
                                                    Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button disabled={isUpdatingWorkspace}>
                                            Save
                                        </Button>
                                    </DialogFooter>
                            </form>
                        </DialogContent>
                        </Dialog>
                        <button disabled={isRemovingWorkspace} onClick={handleRemove} className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-60">
                          <TrashIcon/>
                          <p className="text-sm font-semibold">Delete workspace</p>

                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}