"use client";

import { Toaster } from "react-hot-toast";

/**
 * Mounted in root layout. Provides toast positioning that adapts to mobile —
 * on small screens toasts appear at the TOP to avoid colliding with the
 * bottom tab bar. On larger screens they appear bottom-right (standard).
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "rgba(15, 15, 24, 0.95)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(16px)",
          fontSize: "13px",
          padding: "10px 14px",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          maxWidth: "420px",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "rgba(15, 15, 24, 0.95)",
          },
        },
        error: {
          iconTheme: {
            primary: "#f43f5e",
            secondary: "rgba(15, 15, 24, 0.95)",
          },
        },
      }}
      containerStyle={{
        // Make sure toasts sit above mobile bottom nav (z-50) and modals
        // top-center stays visible even with bottom tab bar
        top: 16,
      }}
    />
  );
}
