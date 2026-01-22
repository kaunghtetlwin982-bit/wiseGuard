// import * as Moleculer from "moleculer";
// import logic from "./logic";

// const userService: Moleculer.ServiceSchema = {
//   name: "user",
//   actions: {
//     // Create a new user
//     create: {
//       params: {
//         name: "string",
//         email: "string",
//         password: "string",
//         phoneNo: "string",
//         address: "string",
//         roleId: { type: "string", enum: ["developer", "owner", "agent"] },
//       },
//       async handler(ctx: Moleculer.Context) {
//         console.log("Calling user.create");
//         console.log("Params:", ctx.params);
//         const params = ctx.params as {
//           name: string;
//           email: string;
//           password: string;
//           phoneNo: string;
//           address: string;
//           roleId: "developer" | "owner" | "agent";
//         };
//         const { name, email, password, phoneNo, address, roleId } = params;
//         return await logic.createUserLogic({
//           name,
//           email,
//           password,
//           phoneNo,
//           address,
//           roleId,
//         });
//       },
//     },

//     // Update an existing user
//     update: {
//       params: {
//         userId: "string",
//         name: { type: "string", optional: true },
//         email: { type: "string", optional: true },
//         password: { type: "string", optional: true },
//         phoneNo: { type: "string", optional: true },
//         address: { type: "string", optional: true },
//         status: { type: "string", enum: ["active", "inactive"], optional: true },
//         roleId: { type: "string", enum: ["developer", "owner", "agent"], optional: true },
//       },
//       async handler(ctx: Moleculer.Context) {
//         console.log("Calling user.update");
//         console.log("Params:", ctx.params);
//         const params = ctx.params as {
//           userId: string;
//           name?: string;
//           email?: string;
//           password?: string;
//           phoneNo?: string;
//           address?: string;
//           status?: "active" | "inactive";
//           roleId?: "developer" | "owner" | "agent";
//         };
//         const { userId, ...updateData } = params;
//         return await logic.updateUserLogic(userId, updateData);
//       },
//     },

//     // Delete a user
//     delete: {
//       params: {
//         userId: "string",
//       },
//       async handler(ctx: Moleculer.Context) {
//         console.log("Calling user.delete");
//         console.log("Params:", ctx.params);
//         const params = ctx.params as { userId: string };
//         const { userId } = params;
//         return await logic.deleteUserLogic(userId);
//       },
//     },

//     // List users with pagination
//     list: {
//       params: {
//         currentPage: "number",
//         limit: "number",
//         sort_by: { type: "string", optional: true },
//         sort_order: { type: "string", optional: true, enum: ["asc", "desc"] },
//         filters: { type: "object", optional: true },
//       },
//       async handler(ctx: Moleculer.Context) {
//         console.log("Calling user.list");
//         console.log("Params:", ctx.params);
//         const params = ctx.params as {
//           currentPage: number;
//           limit: number;
//           sort_by?: string;
//           sort_order?: string;
//           filters?: any;
//         };
//         const {
//           currentPage,
//           limit,
//           sort_by = "createdAt",
//           sort_order = "desc",
//           filters = {},
//         } = params;

//         const sortOrder = sort_order === "desc" ? -1 : 1;

//         return await logic.getUsersLogic(
//           currentPage,
//           limit,
//           sort_by,
//           sortOrder,
//           filters
//         );
//       },
//     },
//   },
// };

// export default userService;