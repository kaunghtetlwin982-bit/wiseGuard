import { createUser, updateUser, deleteUser, getUsers, countUsers } from "./repository";
import Response from "../../helper/responseStatus";
import mongoose, { get, Types } from "mongoose";

const createUserLogic = async (payload: {
  name: string;
  email: string;
  password: string;
  phoneNo: string;
  address: string;
  roleId: "developer" | "owner" | "agent";
}) => {
  try {
    const user = await createUser(payload);
    if (!user) {
      return Response.NOT_IMPLEMENTED("User could not be created");
    }
    return Response.OK(user, "User created successfully");
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.UNKNOWN("Failed to create user");
  }
};

const updateUserLogic = async (
  userId: string,
  payload: Partial<{
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    address: string;
    status: "active" | "inactive";
    roleId: "developer" | "owner" | "agent";
  }>
) => {
  try {
    const user = await updateUser(userId, payload);
    if (!user) {
      return Response.NOT_FOUND("User not found");
    }
    return Response.OK(user, "User updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.UNKNOWN("Failed to update user");
  }
};

const deleteUserLogic = async (userId: string) => {
  try {
    const user = await deleteUser(userId);
    if (!user) {
      return Response.NOT_FOUND("User not found");
    }
    return Response.OK(null, "User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.UNKNOWN("Failed to delete user");
  }
};

const getUsersLogic = async (
  currentPage: number,
  limit: number,
  sort_by: string = "createdAt",
  sort_order: string | 1 | -1 = -1,
  filters: any = {}
) => {
  try {
    const page = Math.max(Number(currentPage), 1);
    const perPage = Math.max(Number(limit), 1);

    const total = await countUsers(filters);
    const users = await getUsers(page, perPage, sort_by, sort_order, filters);

    if (total === 0) {
      return Response.OK({
        users: [],
        pagination: {
          currentPage: page,
          limit: perPage,
          rowsPerPage: 0,
          total: 0,
        },
      });
    }

    return Response.OK(
      {
        users,
        pagination: {
          currentPage: page,
          limit: perPage,
          rowsPerPage: Math.ceil(total / perPage),
          total,
        },
      },
      "Users fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.UNKNOWN("Failed to fetch users");
  }
};

const parseRatingFilters = (filters: any = {}) => {
  const match: any = {};

  if (filters.batchId) {
    match.batchId = new mongoose.Types.ObjectId(filters.batchId);
  }

  if (filters.studentId) {
    match.studentId = new mongoose.Types.ObjectId(filters.studentId);
  }

  if (filters.rating) {
    match.rating = Number(filters.rating);
  }

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) {
      match.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      match.createdAt.$lte = new Date(filters.endDate);
    }
  }

  return match;
};



export default {
  createUserLogic,
  updateUserLogic,
  deleteUserLogic,
  getUsersLogic,
  
};
