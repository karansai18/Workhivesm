"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { AccessToken } from "livekit-server-sdk";

export const createToken = action({
    args: {
        room: v.string(),
        participantName: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        // Fallbacks just for robust logic. Ensure these keys are added in Convex Dashboard.
        if (!apiKey || !apiSecret) {
            throw new Error("LiveKit credentials not configured in Convex");
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: args.participantName,
            // name: args.participantName,
        });

        at.addGrant({ roomJoin: true, room: args.room, canPublish: true, canSubscribe: true });

        return await at.toJwt();
    },
});
