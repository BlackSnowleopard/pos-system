# Module 1: Authentication System
**Status:** Completed

## Overview
This module handles all user security, role-based access control, and session management for the POS system. It ensures that only authorized personnel can access the terminal and restricts sensitive actions (like adding stock) to specific management tiers.

## Core Technologies
- **JSON Web Tokens (JWT):** Used for stateless, secure session handling. The server issues a token upon login which the React frontend stores in Local Storage.
- **bcrypt:** Used to cryptographically hash user passwords. Plain text passwords are theoretically never exposed in the database.
- **React Context API:** (`AuthContext.jsx`) Manages the frontend global state of "who is currently logged in".
- **React Router Dom:** Uses `ProtectedRoute.jsx` to wrap sensitive pages so unauthorized users are blocked from viewing them.

## Database Schema
Relies on the `users` table:
- `user_id`
- `name`
- `email`
- `password_hash`
- `role` (ENUM: 'Administrator', 'Manager', 'Cashier')

## API Endpoints
- `POST /api/auth/register` (Registers a user, hashes password)
- `POST /api/auth/login` (Verifies password, issues JWT)
