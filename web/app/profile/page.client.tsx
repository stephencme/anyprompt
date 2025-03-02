"use client";

import React from "react";

// Define a type for the profile data
type Profile = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
};

interface ProfilePageClientProps {
  profile: Profile | null;
}

export default function ProfilePageClient({ profile }: ProfilePageClientProps) {
  if (!profile) {
    return <div>No profile data found.</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Your Profile</h1>
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="Profile Avatar"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              display: "block",
              margin: "0 auto 1rem",
            }}
          />
        )}
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
      </div>
    </div>
  );
}
