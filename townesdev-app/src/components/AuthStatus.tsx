"use client";

import { useEffect, useState } from "react";

interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export function AuthStatus() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const sessionData = await response.json();
        setUser(sessionData.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-8 w-24 rounded"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <a
          href="/auth/signin"
          className="text-comet-700 dark:text-comet-300 hover:text-nile-blue-600 dark:hover:text-nile-blue-400 font-body text-sm font-medium"
        >
          Sign In
        </a>
        <a
          href="/auth/signup"
          className="bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors"
        >
          Sign Up
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <a
        href="app/"
        className="text-comet-700 dark:text-comet-300 hover:text-nile-blue-600 dark:hover:text-nile-blue-400 font-body text-sm font-medium"
      >
        Client Portal
      </a>
      <span className="text-comet-700 dark:text-comet-300 font-body text-sm">
        Welcome, {user.name}
      </span>
      <button
        onClick={handleSignOut}
        className="text-comet-600 dark:text-comet-400 hover:text-red-600 dark:hover:text-red-400 font-body text-sm font-medium transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
