"use client";

import { useQuery, useAction, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { Loader, AlertTriangle, PhoneOff } from "lucide-react";
import { VideoRoom } from "@/components/video-room";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const CallPage = () => {
    const params = useParams();
    const router = useRouter();
    const callId = params.callId as Id<"calls">;
    const workspaceId = params.workspaceId as Id<"workspaces">;

    const [token, setToken] = useState<string | null>(null);
    const call = useQuery(api.calls.getCallInfo, { callId });
    const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
    const createToken = useAction(api.livekit.createToken);
    const endCallMutation = useMutation(api.calls.endCall);

    useEffect(() => {
        if (!call || call.status !== "active" || !member || token) return;

        let mounted = true;

        const getToken = async () => {
            try {
                // Ensure room exists
                const t = await createToken({
                    room: call.joinCode,
                    participantName: member._id
                });
                if (mounted) setToken(t);
            } catch (error) {
                console.error("Failed to get token", error);
            }
        };

        getToken();
        return () => { mounted = false; };
    }, [call, member, token, createToken]);

    const onDisconnected = () => {
        router.push(`/workspace/${workspaceId}`);
    };

    const handleEndCall = async () => {
        try {
            await endCallMutation({ callId });
            router.push(`/workspace/${workspaceId}`);
        } catch (error) {
            toast.error("Failed to end call");
        }
    }

    if (call === undefined || memberLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#5C3B58]">
                <Loader className="size-6 animate-spin text-white" />
            </div>
        );
    }

    if (call === null) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#5C3B58] text-white">
                <AlertTriangle className="size-8 mb-2" />
                <p>Call not found or unauthorized.</p>
                <Button variant="secondary" className="mt-4" onClick={() => router.push(`/workspace/${workspaceId}`)}>Go Back</Button>
            </div>
        );
    }

    if (call.status === "ended") {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#5C3B58] text-white">
                <PhoneOff className="size-8 mb-2" />
                <p>This call has ended.</p>
                <Button variant="secondary" className="mt-4" onClick={() => router.push(`/workspace/${workspaceId}`)}>Go Back</Button>
            </div>
        )
    }

    if (call.status === "pending") {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#5C3B58] text-white">
                <Loader className="size-8 animate-spin mb-4" />
                <h2 className="text-xl font-bold">Waiting for host/admin...</h2>
                <p className="text-sm mt-2">Your request to start a channel video call is pending admin approval.</p>
                <Button variant="destructive" className="mt-6" onClick={handleEndCall}>Cancel Request</Button>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="h-full flex items-center justify-center bg-black">
                <Loader className="size-6 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black">
            <div className="h-12 border-b border-gray-800 flex items-center justify-end px-4">
                <Button variant="destructive" size="sm" onClick={handleEndCall}>
                    End Call for All
                </Button>
            </div>
            <div className="flex-1 min-h-0 bg-black">
                <VideoRoom room={call.joinCode} token={token} onDisconnected={onDisconnected} />
            </div>
        </div>
    );
};

export default CallPage;
