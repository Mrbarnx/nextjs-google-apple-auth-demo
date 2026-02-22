"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

const APPLE_MOCK_ENABLED =
  String(process.env.NEXT_PUBLIC_APPLE_MOCK_ENABLED).toLowerCase() === "true";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [statusType, setStatusType] = useState("idle");
  const [statusText, setStatusText] = useState("Idle");
  const [busy, setBusy] = useState(false);

  const statusClassName = useMemo(() => `status status-${statusType}`, [statusType]);

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Google sign-up result:", {
        provider: "google",
        id: session?.user?.id || null,
        name: session?.user?.name || null,
        email: session?.user?.email || null,
      });
      router.replace("/dashboard");
    }
  }, [router, session, status]);

  const startGoogle = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    setStatusType("loading");
    setStatusText("Redirecting with Google...");
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const startApple = () => {
    if (busy || !APPLE_MOCK_ENABLED) {
      return;
    }

    setBusy(true);
    setStatusType("loading");
    setStatusText("Redirecting with Apple (mock)...");
    const mockUser = {
      uid: "apple-mock-uid",
      email: "mock-apple-user@example.com",
      displayName: "Mock Apple User",
      provider: "Apple (mock)",
    };
    window.sessionStorage.setItem("mockAppleUser", JSON.stringify(mockUser));
    console.log("Apple sign-up result (MOCK):", mockUser);
    router.push("/dashboard");
  };

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Create your account</h1>
        <p className="subtitle">Choose a sign-up method</p>

        <div className="buttonStack">
          <button type="button" className="authButton googleBtn" disabled={busy} onClick={startGoogle}>
            Continue with Google
          </button>
          <button type="button" className="authButton appleBtn" disabled={busy} onClick={startApple}>
            Continue with Apple
          </button>
        </div>

        <p className={statusClassName}>{statusText}</p>
        <p className="hint">Redirect flow only, no popup windows.</p>
      </section>
    </main>
  );
}
