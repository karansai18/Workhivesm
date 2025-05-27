import { Button } from "@/components/ui/button";
import{
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useworkspaceId } from "@/hooks/use-workspace-id";
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
export const WorkspaceSwitcher=()=>{
    const router = useRouter();
    const workspaceId = useworkspaceId();
    if(!workspaceId) return null;
    const {data:workspace,isLoading:workspaceLoading} = useGetWorkspace({id:workspaceId});
    const {data:workspaces,isLoading:workspacesLoading} = useGetWorkspaces();
    const [_open,setOpen] = useCreateWorkspaceModal();

    const filteredWorkspaces = workspaces?.filter((workspace)=>workspace?._id!=workspaceId)

    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="size-9 rounded-full bg-[#ababad] hover:bg-[#ababad]/80 text-white font-bold text-base p-0">
                    {workspaceLoading ? (
                        <Loader className="size-4 animate-spin" />
                    ) : (
                        workspace?.name?.charAt(0).toUpperCase() || "?"
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="w-64">
                    <DropdownMenuItem onClick={()=>router.push(`/workspace/${workspaceId}`)}  className="cursor-pointer flex-col justify-start items-start capitalize">
                            {workspace?.name}
                            <span className="text-xs txt-muted-foreground">
                                Active workspace
                            </span>
                    </DropdownMenuItem>

                    {filteredWorkspaces?.map((workspace) => (
                        <DropdownMenuItem
                            key={workspace._id}
                            className="cursor-pointer capitalize overflow-hidden"
                            onClick={() => router.push(`/workspace/${workspace._id}`)}
                        >
                        <div className="shrink-0 size-9 relative over-flow-hidden bg-[#616061] text-white font-semi-bold text-lg rounded-md flex items-center justify-center  mr-2">
                            {workspace.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="turncate">{workspace.name}    </p>
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuItem className="cursor-pointer" onClick={()=>setOpen(true)}>
                        <div className="size-9 relative over-flow-hidden bg-[#F2F2F2] text-slate-800 font-semi-bold text-lg rounded-md flex items-center justify-center  mr-2">
                                <Plus/>

                        </div>
                        Create a new workspace 
                    </DropdownMenuItem>
            
            </DropdownMenuContent>
        </DropdownMenu>
            
        
  );
}