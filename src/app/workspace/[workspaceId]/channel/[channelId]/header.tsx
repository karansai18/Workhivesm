import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import { Dialog,DialogContent,DialogTrigger,DialogTitle,DialogClose,DialogHeader,DialogFooter } from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useChannelId } from "@/hooks/use-channel-id";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { toast } from "sonner";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useworkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
    const router = useRouter();
    const channelId = useChannelId();
    const workspaceId = useworkspaceId();
    const [ConfirmDialog,confirm]=useConfirm(
        "Delete this Channel?",
        "You are about to delete this channel. This action cannot be undone.",
    );
    const [value, setValue] = useState(title);
    const [editOpen, setEditOpen] = useState(false);
    const {data:member}=useCurrentMember({workspaceId});
    const {mutate:updateChannel,isPending:isUpdatingChannel}=useUpdateChannel();
    const {mutate:removeChannel,isPending:isRemovingChannel}=useRemoveChannel();
    const handleChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
            const value = e.target.value.replace(/\s+/g,"-").toLowerCase();
            setValue(value);
    };
    const handleEditOpen= (value:boolean)=>{
        if(member?.role!=="admin") return;
        setEditOpen(value);
    }    
    const handleDelete = async()=>{
        const ok = await confirm();
        if(!ok) return;
        removeChannel({id:channelId},
            {
                onSuccess:()=>{
                    toast.success("Channel Deleted Successfully");
                    router.push(`/workspace/${workspaceId}`);
                },
                onError:()=>{
                    toast.error("Failed to Delete Channel");
                }
            }
        );
    };
    const handleSubmit=(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        updateChannel({id:channelId,name:value},
            {
                onSuccess:()=>{
                    toast.success("Channel Updated Successfully");
                    setEditOpen(false);
                },
                onError:()=>{
                    toast.error("Failed to Update Channel");
                }
            }
        );``
    }
  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
        <ConfirmDialog />
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"ghost"} className="text-lg font-semibold px-2 overflow-hidden w-auto" size={"sm"}>
                    <span className="truncate"># {title}</span>
                    <FaChevronDown className="ml-2 size-2.5" />
                </Button>
            </DialogTrigger>    
            <DialogContent className="p-0 bg-gray-50 overflow-hidden">
                <DialogHeader className="bg-white border-b p-4">
                   <DialogTitle># {title}</DialogTitle>
                </DialogHeader>
                <div className="px-4 pb-4 flex flex-col gap-y-2">
                    <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                        <DialogTrigger asChild>
                            <div className="px-5 py-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">Channel name</p>
                                    {member?.role==="admin" && (
                                        <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                                        Edit
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    # {title}
                                </p>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Rename this Channel</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    value={value}
                                    disabled={isUpdatingChannel}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                    minLength={3}
                                    maxLength={80}
                                    placeholder="e.g plan-budget"
                                />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant={"outline"} disabled={isUpdatingChannel}>
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button disabled={isUpdatingChannel}>
                                        Save
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>    
                    </Dialog>
                    {member?.role==="admin" && (
                        <button onClick={handleDelete} disabled={isRemovingChannel} className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                            <TrashIcon className="size-4"/>
                            <p className="text-sm font-semibold">Delete Channel</p>
                        </button>
                    )}    
                </div>        
            </DialogContent>
        </Dialog>
    </div>
  );
};
