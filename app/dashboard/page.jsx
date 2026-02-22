"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Loading your session...");
  const [userData, setUserData] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const mockRaw = window.sessionStorage.getItem("mockAppleUser");
    if (mockRaw) {
      const mockUser = JSON.parse(mockRaw);
      setUserData({
        provider: "Apple (mock)",
        uid: mockUser.uid,
        email: mockUser.email,
        displayName: mockUser.displayName,
      });
      setStatus("Signed in");
      return;
    }

    let auth;
    try {
      auth = getFirebaseAuth();
    } catch (error) {
      console.error("Firebase config error:", error);
      setStatus("Missing Firebase config");
      router.replace("/");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
        return;
      }

      setUserData({
        provider: "Google/Apple (Firebase)",
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
      setStatus("Signed in");
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    if (busy) {
      return;
    }

    try {
      setBusy(true);
      window.sessionStorage.removeItem("mockAppleUser");

      try {
        const auth = getFirebaseAuth();
        await signOut(auth);
      } catch (error) {
        console.log("No Firebase session to sign out:", error);
      }

      router.replace("/");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Dashboard</h1>
        <p className="subtitle">{status}</p>

        {userData ? (
          <div className="buttonStack" style={{ gap: "8px", marginBottom: "14px" }}>
            <div><strong>Provider:</strong> {userData.provider}</div>
            <div><strong>Name:</strong> {userData.displayName || "N/A"}</div>
            <div><strong>Email:</strong> {userData.email || "N/A"}</div>
            <div><strong>User ID:</strong> {userData.uid || "N/A"}</div>
          </div>
        ) : null}

        <button type="button" className="authButton appleBtn" onClick={handleSignOut} disabled={busy}>
          {busy ? "Signing out..." : "Sign out"}
        </button>
      </section>
    </main>
  );
}
