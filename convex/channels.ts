import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
export const remove=mutation({
    args:{
        id:v.id("channels"),
    },
    handler:async (ctx,args)=>{
        const userId = await auth.getUserId(ctx);
        if(!userId)
        {
            throw new Error("Unauthorized");
        }
        const channel = await ctx.db.get(args.id);
        if(!channel)
        {
            throw new Error("Channel not found");
        }
        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id",(q)=>q.eq("workspaceId",channel.workspaceId).eq("userId",userId)).unique();
        
        if(!member || member.role!=="admin")
        {
            throw new Error("Unauthorized");
        }
        await ctx.db.delete(args.id);
        
        return args.id;
    }
});    
export const update=mutation({
    args:{
        id:v.id("channels"),
        name:v.string(),
    },
    handler:async (ctx,args)=>{
        const userId = await auth.getUserId(ctx);
        if(!userId)
        {
            throw new Error("Unauthorized");
        }
        const channel = await ctx.db.get(args.id);
        if(!channel)
        {
            throw new Error("Channel not found");
        }
        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id",(q)=>q.eq("workspaceId",channel.workspaceId).eq("userId",userId)).unique();
        
        if(!member || member.role!=="admin")
        {
            throw new Error("Unauthorized");
        }
        await ctx.db.patch(args.id,{
            name:args.name,
           
        });
        
        return args.id;
    }
});    
export const create=mutation({
    args:{
        workspaceId:v.id("workspaces"),
        name:v.string()
    },
    handler:async (ctx,args)=>{
        const userId = await auth.getUserId(ctx);
        if(!userId)
        {
            throw new Error("Unauthorized");
        }
        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id",(q)=>q.eq("workspaceId",args.workspaceId).eq("userId",userId)).unique();
        if(!member)
        {
            throw new Error("Not a member of this workspace");
        }
        if(member.role!=="admin")
        {
            throw new Error("Only admins can create channels");
        }
        const parsedName =args.name.replace(/\s+/g,"-").toLowerCase();
        
        const channelId = await ctx.db.insert("channels",{
            name:parsedName,
            workspaceId:args.workspaceId,
        });
        
        return channelId;
    }
});
export const getById = query({
    args:{
        id:v.id("channels"),
    },
    handler: async (ctx,args) => {
        const userId = await auth.getUserId(ctx);
        if(!userId)
        {
            return null;
        }
        const channel = await ctx.db.get(args.id);
        if(!channel)
        {
           return null;
        }
        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id",(q)=>q.eq("workspaceId",channel.workspaceId).eq("userId",userId)).unique();
        if(!member)
        {
            return  null;  
        }
        return channel;
    },
});
export const get = query({
    args:{
        workspaceId:v.id("workspaces")
    },
    handler: async (ctx,args) =>{

        const userId = await auth.getUserId(ctx);
        if(!userId)
        {
            return [];
        }

            const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id",(q)=>q.eq("workspaceId",args.workspaceId).eq("userId",userId),).unique()
            // it gives all the data ur  (user) part of workspaces
            //if member is empty means the person is not part of this workspace
            
          if(!member)
          {
            return [];
          }


          const channels = await ctx.db.query("channels").withIndex("by_workspace_id",(q)=>q.eq("workspaceId",args.workspaceId)).collect();
          return channels;
    }
}) 