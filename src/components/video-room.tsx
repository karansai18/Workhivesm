"use client";

import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

interface VideoRoomProps {
    room: string;
    token: string;
    onDisconnected: () => void;
}

export const VideoRoom = ({ room, token, onDisconnected }: VideoRoomProps) => {
    return (
        <LiveKitRoom
            data-lk-theme="default"
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            token={token}
            connect={true}
            video={true}
            audio={true}
            onDisconnected={onDisconnected}
            className="h-full"
        >
            <VideoConference />
        </LiveKitRoom>
    );
};
