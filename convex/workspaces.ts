import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

const generatedCode=()=>{
    const code = Array.from({length:6},()=>"0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random()*36)]).join("");
    return code;
}
export const join= mutation({
    args: {
        joinCode: v.string(),
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
            if(!userId)
            {
                throw new Error("Unauthorized");
            } 
        const workspace = await ctx.db.get(args.workspaceId);
        if(!workspace)
        {
            throw new Error("Workspace not found");
        }
        if(workspace.joinCode !== args.joinCode.toLowerCase()){
            throw new Error("Invalid join code");
        }
        const existingMember = await ctx.db.query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                q.eq("workspaceId", args.workspaceId).eq("userId", userId)
            )
            .unique();
        if(existingMember) {
            throw new Error("You are already a member of this workspace");
        }  
        await ctx.db.insert("members", {
            userId,
            workspaceId: workspace._id,
            role: "member",
        });     
        return workspace._id;
    },
});
export const newJoinCode = mutation({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
            if(!userId)
            {
                throw new Error("Unauthorized");
            } 
        const member = await ctx.db.query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                q.eq("workspaceId", args.workspaceId).eq("userId", userId)
            )
            .unique();    
        if(!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }    
        const joinCode = generatedCode();
        await ctx.db.patch(args.workspaceId, {
            joinCode,
        });
        return args.workspaceId;
    }
});
export const create = mutation({
      args:{
        name: v.string(),
      },
      handler: async(ctx,args)=>{
        const userId = await auth.getUserId(ctx);
            if(!userId)
            {
                throw new Error("Unauthorized");
            } 
            const joinCode = generatedCode();
            const workspaceId = await ctx.db.insert("workspaces",{
                name:args.name,
                userId,
                joinCode,
            });

            // It inserts a document into a table (in this case, "workspaces").

            // It automatically generates a unique document ID.  

            await ctx.db.insert("members",{
                userId,
                workspaceId,
                role:"admin"
            })

            await ctx.db.insert("channels",{
                name:"general",
                workspaceId
            })
            
            return workspaceId;
            
      }  

})
export const get = query({
    args:{},
    handler: async (ctx) =>{

        const userId = await auth.getUserId(ctx);
        if(!userId)
        {
            return [];
        }

            const members = await ctx.db.query("members").withIndex("by_user_id",(q)=>q.eq("userId",userId)).collect();
            // it gives all the data ur  (user) part of workspaces
            
            const workspaceIds  = members.map((member)=>member.workspaceId);
            const workspaces =[];
            for(const workspaceId of workspaceIds)
            {
                const workspace =await ctx.db.get(workspaceId);
                if(workspace){
                    workspaces.push(workspace);
                }
            }  
            return workspaces;
    


        return await ctx.db.query("workspaces").collect();

        
    }
})

export const getInfoById=query({
    args:{id: v.id("workspaces")},
    handler:async(ctx,args)=>
    {
        const userId = await auth.getUserId(ctx);
       if(!userId){
         return null;
       }
       const member=await ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id",(q)=>
        q.eq("workspaceId",args.id).eq("userId",userId),
        )
        .unique();
       const workspace = await ctx.db.get(args.id); 
       return {
         name:workspace?.name,
         isMember:!!member,
       };
    },
});
export const getById= query({
    args:{ id: v.id("workspaces")},
    handler:async(ctx,args)=>
    {
        const userId = await auth.getUserId(ctx);
        if(!userId)
        {
                throw new Error("Unauthorized");
        }
        const member=await ctx.db 
            .query("members")
            .withIndex("by_workspace_id_user_id",(q)=>
                q.eq("workspaceId",args.id).eq("userId",userId),
            )
            .unique();

        if(!member)
        {
            return null;
        }    

        return await ctx.db.get(args.id);
    }
})

//for useupdateworkspace
export const update = mutation({
    args:{
        id:v.id("workspaces"),
        name:v.string(),
    },
    handler: async (ctx,args)=>{
        const userId = await auth.getUserId(ctx);
        if(!userId)
        {
                throw new Error("Unauthorized");
        }
        const member=await ctx.db 
            .query("members")
            .withIndex("by_workspace_id_user_id",(q)=>
                q.eq("workspaceId",args.id).eq("userId",userId),
            )
            .unique();
        if(!member|| member.role!=="admin")
        {
            throw new Error("Unauthorized")
        }
        await ctx.db.patch(args.id,{
                name:args.name,

        });
        return args.id;
    },
});


export const remove = mutation({
    args:{
        id:v.id("workspaces"),
        
    },
    handler: async (ctx,args)=>{
        const userId = await auth.getUserId(ctx);
        if(!userId)
        {
                throw new Error("Unauthorized");
        }
        const member=await ctx.db 
            .query("members")
            .withIndex("by_workspace_id_user_id",(q)=>
                q.eq("workspaceId",args.id).eq("userId",userId),
            )
            .unique();
        if(!member|| member.role!=="admin")
        {
            throw new Error("Unauthorized")
        }
        //we have to delete members associated with workspace
        const [members, channels, conversations, messages, reactions] = await Promise.all([
            ctx.db.query("members").withIndex("by_workspace_id",(q)=> q.eq("workspaceId",args.id)).collect(),
            ctx.db.query("channels").withIndex("by_workspace_id",(q)=> q.eq("workspaceId",args.id)).collect(),
            ctx.db.query("conversations").withIndex("by_workspace_id",(q)=> q.eq("workspaceId",args.id)).collect(),
            ctx.db.query("messages").withIndex("by_workspace_id",(q)=> q.eq("workspaceId",args.id)).collect(),
            ctx.db.query("reactions").withIndex("by_workspace_id",(q)=> q.eq("workspaceId",args.id)).collect(),
        ]);
        for(const member of members )
            await ctx.db.delete(member._id)
        for(const c of channels )
            await ctx.db.delete(c._id)
        for(const c of conversations )
            await ctx.db.delete(c._id)
        for(const m of messages )
            await ctx.db.delete(m._id)
        for(const r of reactions )
            await ctx.db.delete(r._id)
        await ctx.db.delete(args.id);
        return args.id;

        
    },
});


export const getByJoinCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .filter(q => q.eq(q.field("joinCode"), args.code.toLowerCase()))
      .first();

    if (!workspace) return null;

    return {
      _id: workspace._id,
      name: workspace.name,
    };
  },
});



// These all are api endpoints