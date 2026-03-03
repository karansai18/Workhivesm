"use client";

import { Button } from "./ui/button";
import { Phone, Video, Loader } from "lucide-react";
import { useworkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface VideoCallButtonProps {
    channelId?: Id<"channels">;
    conversationId?: Id<"conversations">;
    type: "channel" | "dm";
}

export const VideoCallButton = ({ channelId, conversationId, type }: VideoCallButtonProps) => {
    const workspaceId = useworkspaceId();
    const { data: member, isLoading: isMemberLoading } = useCurrentMember({ workspaceId: workspaceId! });
    const requestCall = useMutation(api.calls.requestCall);
    const router = useRouter();

    const [isPending, setIsPending] = useState(false);

    const handleCallRequest = async () => {
        if (!member) return;

        setIsPending(true);
        try {
            const callId = await requestCall({
                workspaceId,
                type,
                channelId,
                conversationId,
            });
            // Let the caller navigate immediately. A modal will pop if it's pending.
            router.push(`/workspace/${workspaceId}/call/${callId}`);
        } catch (error) {
            toast.error("Failed to process call request");
            console.error(error);
        } finally {
            setIsPending(false);
        }
    };

    if (isMemberLoading) {
        return <Loader className="size-5 animate-spin text-muted-foreground mr-4" />;
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleCallRequest}
            disabled={isPending}
            className="mr-2"
        >
            {isPending ? <Loader className="size-5 animate-spin" /> : <Video className="size-5" />}
        </Button>
    )
};
