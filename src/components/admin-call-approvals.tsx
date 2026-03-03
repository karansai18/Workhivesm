"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useworkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { Button } from "@/components/ui/button";
import { Check, X, Video } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const AdminCallApprovals = () => {
    const workspaceId = useworkspaceId() as Id<"workspaces">;
    const { data: member } = useCurrentMember({ workspaceId });
    const router = useRouter();

    const pendingCalls = useQuery(api.calls.getPendingCallsForWorkspace, { workspaceId });
    const approveCall = useMutation(api.calls.approveCall);
    const declineCall = useMutation(api.calls.declineCall);

    if (!member || member.role !== "admin" || !pendingCalls || pendingCalls.length === 0) {
        return null;
    }

    const handleApprove = async (callId: Id<"calls">) => {
        try {
            await approveCall({ callId });
            router.push(`/workspace/${workspaceId}/call/${callId}`);
        } catch (error) {
            toast.error("Failed to approve call");
        }
    };

    const handleDecline = async (callId: Id<"calls">) => {
        try {
            await declineCall({ callId });
            toast.success("Call declined");
        } catch (error) {
            toast.error("Failed to decline call");
        }
    };

    return (
        <div className="p-4 border-b border-gray-200 bg-amber-50 flex flex-col gap-2">
            <h3 className="font-semibold text-sm flex items-center"><Video className="size-4 mr-2" /> Pending Call Requests</h3>
            {pendingCalls.map((call) => (
                <div key={call._id} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                    <div>
                        <span className="font-semibold">{call.requestorName}</span> wants to start a call in <span className="font-semibold">#{call.channelName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-8" onClick={() => handleDecline(call._id)}>
                            <X className="size-4 mr-1" /> Decline
                        </Button>
                        <Button size="sm" className="h-8" onClick={() => handleApprove(call._id)}>
                            <Check className="size-4 mr-1" /> Approve & Join
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};
