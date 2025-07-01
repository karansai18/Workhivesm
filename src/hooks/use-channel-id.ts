    // import { useParams } from "next/navigation";
    // import { Id } from "../../convex/_generated/dataModel"

    // export const useworkspaceId=()=>{
    //     const params =  useParams();
    //     return params.workspaceId as Id<"workspaces">;
    // }

    import { useParams } from "next/navigation";
    import { Id } from "../../convex/_generated/dataModel";

    export const useChannelId = (): Id<"channels"> | undefined => {
    const params = useParams();

    const rawId = params?.channelId as string | undefined;

    if (!rawId) return undefined;

    // Remove URL-encoded characters like %7D or invalid trailing/leading junk
    const cleanId = decodeURIComponent(rawId).replace(/[^a-zA-Z0-9_-]/g, "");

    return cleanId as Id<"channels">;
    }; 