import express from "express";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { User } from "../models/userModel";
import ResponseStatus from "../helper/responseStatus";
import { authenticateToken } from "../middleware/authMiddleware";
import config from "../config/config";

const router = express.Router();

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json(
        ResponseStatus.INVALID_ARGUMENT("Email and password are required")
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json(
        ResponseStatus.UNAUTHENTICATED("Invalid email or password")
      );
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(403).json(
        ResponseStatus.PERMISSION_DENIED("Account is not active")
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        ResponseStatus.UNAUTHENTICATED("Invalid email or password")
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        roleId: user.roleId
      },
      config.JWT_SECRET || "your-secret-key",
      {
        expiresIn: "7d" // Token expires in 7 days
      }
    );

    // Return user data and token
    res.status(200).json(
      ResponseStatus.OK({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          phoneNo: user.phoneNo,
          address: user.address,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }, "Login successful")
    );

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json(
      ResponseStatus.UNKNOWN("Login failed")
    );
  }
});

// Logout endpoint (client-side token removal)
router.post("/logout", authenticateToken, (req, res) => {
  // With JWT, logout is typically handled client-side by removing the token
  // Server-side logout would require token blacklisting (not implemented here)
  res.status(200).json(
    ResponseStatus.OK(null, "Logged out successfully")
  );
});

// Get current user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // User data is already attached by authenticateToken middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json(
        ResponseStatus.NOT_FOUND("User not found")
      );
    }

    res.status(200).json(
      ResponseStatus.OK({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          phoneNo: user.phoneNo,
          address: user.address,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }, "Profile retrieved successfully")
    );

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json(
      ResponseStatus.UNKNOWN("Failed to get profile")
    );
  }
});

// Register new user (optional - you might want to restrict this)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phoneNo, address, roleId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phoneNo || !address) {
      return res.status(400).json(
        ResponseStatus.INVALID_ARGUMENT("All fields are required")
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json(
        ResponseStatus.ALREADY_EXISTS("User with this email already exists")
      );
    }

    // Create new user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNo,
      address,
      roleId: roleId || "developer", // Default role
      status: "active"
    });

    // Generate JWT token for immediate login
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        roleId: newUser.roleId
      },
      config.JWT_SECRET || "your-secret-key",
      {
        expiresIn: "7d"
      }
    );

    res.status(201).json(
      ResponseStatus.OK({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          roleId: newUser.roleId,
          phoneNo: newUser.phoneNo,
          address: newUser.address,
          status: newUser.status,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        }
      }, "Registration successful")
    );

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json(
      ResponseStatus.UNKNOWN("Registration failed")
    );
  }
});

// Refresh token endpoint (optional)
router.post("/refresh", authenticateToken, (req, res) => {
  try {
    // Generate new token with same payload
    const token = jwt.sign(
      {
        userId: req.user.id,
        email: req.user.email,
        roleId: req.user.roleId
      },
      config.JWT_SECRET || "your-secret-key",
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json(
      ResponseStatus.OK({ token }, "Token refreshed successfully")
    );

  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json(
      ResponseStatus.UNKNOWN("Token refresh failed")
    );
  }
});

export default router;