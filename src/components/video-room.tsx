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
    const livekitUrl =
        process.env.NEXT_PUBLIC_LIVEKIT_URL ||
        process.env.LIVEKIT_URL;
    if (!livekitUrl) {
        console.error("Missing NEXT_PUBLIC_LIVEKIT_URL");
    }

    return (
        <LiveKitRoom
            data-lk-theme="default"
            serverUrl={livekitUrl}
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
