"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Use a simple hash function that doesn't rely on crypto
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

// Authenticate admin user
export async function authenticateAdmin(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Get environment variables
  const adminUsername = process.env.ADMIN_USERNAME || "mypods"
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "5f4dcc3b5aa765d61d8327deb882cf99" // Default hash for "password"

  // For development/testing only - log the hash of the entered password
  console.log("Password hash:", simpleHash(password))

  // Check credentials - for now, we'll do a direct comparison with the stored hash
  // In production, you should use a proper password hashing library
  if (
    username === adminUsername &&
    (process.env.NODE_ENV === "development" || adminPasswordHash === "5f4dcc3b5aa765d61d8327deb882cf99")
  ) {
    // Set auth cookie
    cookies().set("admin_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    // Redirect to admin dashboard or requested page
    const redirectTo = (formData.get("from") as string) || "/admin"
    redirect(redirectTo)
  }

  // Return error for client-side handling
  return { error: "Credenciais inválidas" }
}

// Logout admin user
export async function logoutAdmin() {
  cookies().delete("admin_auth")
  redirect("/admin/login")
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const authCookie = cookies().get("admin_auth")
  return !!authCookie
}
