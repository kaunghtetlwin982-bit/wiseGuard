"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ratingService = {
    name: "rating",
    actions: {
    // List all batches
    // list: {
    //   params: {
    //     currentPage: "number",
    //     limit: "number",
    //     sort_by: { type: "string", optional: true },
    //     sort_order: { type: "string", optional: true, enum: ["asc", "desc"] },
    //     filters: { type: "object", optional: true },
    //     userRoleName: { type: "string", optional: true },
    //     roleEntityId: { type: "string", optional: true },
    //   },
    //   handler(ctx: Moleculer.Context<listType>) {
    //     const {
    //       currentPage,
    //       limit,
    //       sort_by,
    //       sort_order,
    //       filters,
    //       userRoleName,
    //       roleEntityId,
    //     } = ctx.params;
    //     console.log("In service rating.list 38", ctx.params);
    //     return logic.ratingList(
    //       currentPage,
    //       limit,
    //       sort_by || "createdAt",
    //       sort_order || "desc",
    //       filters,
    //       userRoleName,
    //       roleEntityId
    //     );
    //   }
    // },
    // // Create a new rating
    // create: {
    //   params: {
    //     batchId: "string",
    //     rating: "number",
    //     feedback: "string",
    //     studentId: "string",
    //   },
    //   async handler(ctx: Moleculer.Context<createType>) {
    //     console.log("Cal rating.create");
    //     console.log("Params :", ctx.params);
    //     const { batchId, rating, feedback, studentId } = ctx.params;
    //     return await logic.createRating(batchId, rating, feedback, studentId);
    //   },
    // },
    },
};
exports.default = ratingService;
