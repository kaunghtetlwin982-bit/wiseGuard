import { User } from "../../models/userModel";
import { Types } from "mongoose";
import Response from "../../helper/responseStatus";

export const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phoneNo: string;
  address: string;
  roleId: "developer" | "owner" | "agent";
}) => {
  return User.create(payload);
};

export const updateUser = async (
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
  return User.findByIdAndUpdate(userId, payload, { new: true });
};

export const deleteUser = async (userId: string) => {
  return User.findByIdAndDelete(userId);
};

export const getUsers = async (
  currentPage: number,
  limit: number,
  sort_by: string = "createdAt",
  sort_order: string | 1 | -1 = -1,
  filters: any = {}
) => {
  const order: 1 | -1 = sort_order === "desc" ? -1 : 1;

  const pipeline: any[] = [
    { $match: filters },
    { $sort: { [sort_by]: order } },
    { $skip: (currentPage - 1) * limit },
    { $limit: limit },
  ];

  // Final projection
  pipeline.push({
    $project: {
      _id: 0,
      id: "$_id",
      name: 1,
      email: 1,
      phoneNo: 1,
      address: 1,
      status: 1,
      roleId: 1,
      createdAt: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$createdAt",
        },
      },
      updatedAt: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$updatedAt",
        },
      },
    },
  });

  return User.aggregate(pipeline);
};

export const countUsers = async (filters: any = {}) => {
  const count = await User.aggregate([
    { $match: filters },
    { $count: "total" },
  ]);

  return count[0]?.total || 0;
};
