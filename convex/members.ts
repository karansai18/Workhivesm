// import {v} from "convex/values";
// import { auth } from "./auth"
// import { query } from "./_generated/server";
// export const current=query({
//     args:{workkspaceId:v.id("workspaces")},
//     handler:async(ctx,args)=>{
//         const userId=await auth.getUserId(ctx);
//         if(!userId){
//             return null;
//         }
//         const member= await ctx.db
//             .query("members")
//             .withIndex("by_workspace_id_user_id",(q)=>
//                 q.eq("workspaceId",args.workkspaceId).eq("userId",userId)
//             )
//             .collect();
//         if(!member){
//             return null;
//         }    
//         return member;
//     }
// })

import { v } from "convex/values";
import { auth } from "./auth";
import { query,QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
const populateUser=(ctx:QueryCtx,id:Id<"users">)=>{
          return ctx.db.get(id);
};

export const get = query({
  args:{workspaceId:v.id("workspaces")},
  handler:async(ctx,args)=>{
    const userId = await auth.getUserId(ctx);
    if (!userId) 
    {
      return [];
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) 
    {
      return [];
    }
    const data = await ctx.db.query("members").withIndex("by_workspace_id",(q)=>q.eq("workspaceId",args.workspaceId)).collect()
    const members = [];
   
    for (const member of data) 
    {
      const user = await populateUser(ctx, member.userId);
      if (user) 
      {
        members.push({
          ...member,
          user,
        });
      }
    }
    return members;
  },  
})

export const current = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member) 
    {
      return null;
    }
    return member; // return the current member
  }
});