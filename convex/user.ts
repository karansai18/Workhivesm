
// export const current = query({
//     args:{},
//     handler:async(ctx)=>{
//         const userId = await auth.getUserId(ctx);

//         if(userId==null)
//         {
//             return null;
//         }
//         return await ctx.db.get(userId);
//     }
// })

// convex/users.ts

// import { query } from "./_generated/server";
// import { auth } from "./auth";

// export const current = query({
//   args: {},
//   handler: async (ctx) => {
//     const identity = await auth(ctx);

//     if (!identity) {
//       return null;
//     }

//     return await ctx.db.get(identity.tokenIdentifier); // Or identity.subject
//   },
// });


// convex/users.ts
import { query } from "./_generated/server";
import { auth } from "./auth";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx); // ✅ CORRECT usage

    if (!userId) return null;

    return await ctx.db.get(userId);    
  },
});

//Asks the auth helper (from @convex-dev/auth) to return the currently logged-in user's ID, if any.

// If the user is not authenticated, userId will be null.

