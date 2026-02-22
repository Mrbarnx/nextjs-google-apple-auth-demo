"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [pageStatus, setPageStatus] = useState("Loading your session...");
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
      setPageStatus("Signed in");
      return;
    }
    if (sessionStatus === "loading") {
      return;
    }

    if (sessionStatus !== "authenticated" || !session?.user) {
      router.replace("/");
      return;
    }

    setUserData({
      provider: "Google (Auth.js)",
      uid: session.user.id || "N/A",
      email: session.user.email || "N/A",
      displayName: session.user.name || "N/A",
    });
    setPageStatus("Signed in");
  }, [router, session, sessionStatus]);

  const handleSignOut = async () => {
    if (busy) {
      return;
    }

    try {
      setBusy(true);
      window.sessionStorage.removeItem("mockAppleUser");
      await signOut({ callbackUrl: "/" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <section className="card dashboardCard">
        <header className="dashboardHeader">
          <div>
            <h1 className="title">Dashboard</h1>
            <p className="subtitle">{pageStatus}</p>
          </div>
          <span className="statusPill">{userData?.provider || "Checking session"}</span>
        </header>

        {userData ? (
          <div className="dashboardGrid">
            <article className="infoPanel">
              <h2 className="panelTitle">Profile</h2>
              <div className="infoRow"><span>Name</span><strong>{userData.displayName || "N/A"}</strong></div>
              <div className="infoRow"><span>Email</span><strong>{userData.email || "N/A"}</strong></div>
              <div className="infoRow"><span>Provider</span><strong>{userData.provider}</strong></div>
              <div className="infoRow"><span>User ID</span><strong className="mono">{userData.uid || "N/A"}</strong></div>
            </article>

            <article className="infoPanel">
              <h2 className="panelTitle">Session</h2>
              <p className="panelText">
                You are signed in and can access protected pages. This page can be expanded
                later with account settings, billing, or profile updates.
              </p>
              <button
                type="button"
                className="authButton appleBtn"
                onClick={handleSignOut}
                disabled={busy}
              >
                {busy ? "Signing out..." : "Sign out"}
              </button>
            </article>
          </div>
        ) : (
          <p className="hint">Loading your account data...</p>
        )}
      </section>
    </main>
  );
}
