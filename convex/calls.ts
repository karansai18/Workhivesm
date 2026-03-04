import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const requestCall = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
        type: v.union(v.literal("channel"), v.literal("dm")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                q.eq("workspaceId", args.workspaceId).eq("userId", userId)
            )
            .unique();

        if (!member) {
            throw new Error("Unauthorized");
        }

        // Check if there is already an active or pending call for this context
        let existingCall;
        if (args.type === "channel" && args.channelId) {
            existingCall = await ctx.db
                .query("calls")
                .withIndex("by_channel_id", (q) => q.eq("channelId", args.channelId))
                .filter((q) => q.neq(q.field("status"), "ended"))
                .first();
        } else if (args.type === "dm" && args.conversationId) {
            existingCall = await ctx.db
                .query("calls")
                .withIndex("by_conversation_id", (q) => q.eq("conversationId", args.conversationId))
                .filter((q) => q.neq(q.field("status"), "ended"))
                .first();
        }

        if (existingCall) {
            return existingCall._id; // Just return existing call
        }

        const joinCode = Math.random().toString(36).substring(2, 12);
        // If it's an admin or a DM, auto-start. DMs don't need admin approval to start.
        const isAutoStart = member.role === "admin" || args.type === "dm";

        const callId = await ctx.db.insert("calls", {
            workspaceId: args.workspaceId,
            type: args.type,
            status: isAutoStart ? "active" : "pending",
            channelId: args.channelId,
            conversationId: args.conversationId,
            memberId: member._id,
            joinCode,
        });

        // Get user name for the message
        const user = await ctx.db.get(userId);
        const userName = user?.name || "Someone";

        // Create a message in the channel/conversation about the call
        if (args.type === "channel" && args.channelId) {
            await ctx.db.insert("messages", {
                body: JSON.stringify({ type: "call", callId, joinCode, userName }),
                memberId: member._id,
                workspaceId: args.workspaceId,
                channelId: args.channelId,
                conversationId: undefined,
                parentMessageId: undefined,
                callId: callId,
                updatedAt: Date.now(),
            });
        } else if (args.type === "dm" && args.conversationId) {
            await ctx.db.insert("messages", {
                body: JSON.stringify({ type: "call", callId, joinCode, userName }),
                memberId: member._id,
                workspaceId: args.workspaceId,
                channelId: undefined,
                conversationId: args.conversationId,
                parentMessageId: undefined,
                callId: callId,
                updatedAt: Date.now(),
            });
        }

        return callId;
    },
});

export const getCallInfo = query({
    args: {
        callId: v.id("calls"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return null;
        }
        const call = await ctx.db.get(args.callId);
        if (!call) return null;

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                q.eq("workspaceId", call.workspaceId).eq("userId", userId)
            )
            .unique();

        if (!member) return null;

        return call;
    },
});

export const getActiveCallForChannel = query({
    args: { channelId: v.id("channels") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const call = await ctx.db
            .query("calls")
            .withIndex("by_channel_id", (q) => q.eq("channelId", args.channelId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .first();

        return call;
    }
});

export const getPendingCallsForWorkspace = query({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId))
            .unique();

        if (!member || member.role !== "admin") return []; // Only admins can see pending requests

        const pendingCalls = await ctx.db
            .query("calls")
            .withIndex("by_workspace_status", (q) =>
                q.eq("workspaceId", args.workspaceId).eq("status", "pending")
            )
            .collect();

        // Populate channel and member info
        const results = [];
        for (const call of pendingCalls) {
            const requestor = await ctx.db.get(call.memberId);
            const user = requestor ? await ctx.db.get(requestor.userId) : null;
            const channel = call.channelId ? await ctx.db.get(call.channelId) : null;

            results.push({
                ...call,
                requestorName: user?.name,
                channelName: channel?.name
            });
        }

        return results;
    }
});

export const approveCall = mutation({
    args: { callId: v.id("calls") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const call = await ctx.db.get(args.callId);
        if (!call) throw new Error("Call not found");

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", call.workspaceId).eq("userId", userId))
            .unique();

        if (!member || member.role !== "admin") throw new Error("Only admins can approve calls");

        await ctx.db.patch(args.callId, { status: "active" });
        return true;
    }
});

export const declineCall = mutation({
    args: { callId: v.id("calls") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const call = await ctx.db.get(args.callId);
        if (!call) throw new Error("Call not found");

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", call.workspaceId).eq("userId", userId))
            .unique();

        if (!member || member.role !== "admin") throw new Error("Only admins can decline calls");

        await ctx.db.patch(args.callId, { status: "ended" });
        return true;
    }
});

export const endCall = mutation({
    args: { callId: v.id("calls") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const call = await ctx.db.get(args.callId);
        if (!call) throw new Error("Call not found");

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => q.eq("workspaceId", call.workspaceId).eq("userId", userId))
            .unique();

        if (!member) throw new Error("Unauthorized");

        // Allow ending if admin OR if you were the one who started it
        if (member.role !== "admin" && call.memberId !== member._id) {
            throw new Error("Unauthorized to end call");
        }

        await ctx.db.patch(args.callId, { status: "ended" });
        return true;
    }
});
