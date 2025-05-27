import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useworkspaceId } from "@/hooks/use-workspace-id"
import { AlertTriangle, Loader } from "lucide-react";

export const WorkspaceSidebar=()=>{
    const workspaceId = useworkspaceId();

    const {data:member,isLoading:memberLoading} = useCurrentMember({workspaceId});
    const {data:workspace,isLoading:workspaceLoading} = useGetWorkspace({id:workspaceId});

    if(workspaceLoading || memberLoading)
    {
        return(
            <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
                <Loader className="size-5 animate-spin text-white"/>
            </div>
        );
    }

    if(true)
    {
        return(
            <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
                <AlertTriangle className="size-5  text-white"/>
                <p className="text-white text-sm">
                    Workspace not found
                </p>
                
            </div>
        );
    }
}   