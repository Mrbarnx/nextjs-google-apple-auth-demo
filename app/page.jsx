"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  OAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithRedirect,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebaseClient";

const APPLE_MOCK_ENABLED =
  String(process.env.NEXT_PUBLIC_APPLE_MOCK_ENABLED).toLowerCase() === "true";
const AUTH_ATTEMPT_KEY = "authAttemptProvider";
const LAST_PROVIDER_KEY = "lastProvider";

export default function HomePage() {
  const router = useRouter();
  const [statusType, setStatusType] = useState("idle");
  const [statusText, setStatusText] = useState("Idle");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [debugLines, setDebugLines] = useState([]);

  const statusClassName = useMemo(() => `status status-${statusType}`, [statusType]);
  const addDebug = (message) => {
    const ts = new Date().toLocaleTimeString();
    setDebugLines((prev) => {
      const next = [`${ts} - ${message}`, ...prev].slice(0, 20);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("authDebugLines", JSON.stringify(next));
      }
      return next;
    });
  };

  useEffect(() => {
    const storedDebug = window.sessionStorage.getItem("authDebugLines");
    if (storedDebug) {
      try {
        setDebugLines(JSON.parse(storedDebug));
      } catch {
        // no-op
      }
    }

    addDebug(`Page loaded at ${window.location.origin}${window.location.pathname}`);
    const url = new URL(window.location.href);
    const isAppleMock = url.searchParams.get("appleMockRedirect") === "1";

    if (isAppleMock) {
      const mockResult = {
        providerId: "apple.com",
        mock: true,
        user: {
          uid: "apple-mock-uid",
          email: "mock-apple-user@example.com",
          displayName: "Mock Apple User",
        },
      };
      console.log("Apple sign-up result (MOCK):", mockResult);
      addDebug("Apple mock redirect result received");
      setStatusType("success");
      setStatusText("Success (Apple mock)");
      window.sessionStorage.setItem("mockAppleUser", JSON.stringify(mockResult.user));
      url.searchParams.delete("appleMockRedirect");
      window.history.replaceState({}, "", url.toString());
      router.push("/dashboard");
      return;
    }

    let auth;
    let unsubscribe = () => {};
    try {
      auth = getFirebaseAuth();
      setReady(true);
      addDebug("Firebase auth initialized");
    } catch (error) {
      console.error("Firebase config error:", error);
      addDebug(`Firebase config error: ${error?.message || "unknown"}`);
      setStatusType("error");
      setStatusText("Missing Firebase config");
      return;
    }

    // Keep users signed in across refreshes and ensure redirect result race conditions
    // still land on dashboard.
    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        addDebug(`Auth state user found: ${user.email || user.uid}`);
        router.replace("/dashboard");
      } else {
        addDebug("Auth state: no active user");
      }
    });

    getRedirectResult(auth)
      .then((result) => {
        if (!result) {
          addDebug("No redirect result returned");
          const attemptProvider = window.sessionStorage.getItem(AUTH_ATTEMPT_KEY);
          if (attemptProvider) {
            setStatusType("error");
            setStatusText(`Redirect session lost after ${attemptProvider} sign-in`);
            addDebug(`Redirect session lost for ${attemptProvider}`);
            window.sessionStorage.removeItem(AUTH_ATTEMPT_KEY);
            window.sessionStorage.removeItem(LAST_PROVIDER_KEY);
          }
          return;
        }

        const lastProvider = window.sessionStorage.getItem(LAST_PROVIDER_KEY) || "unknown";
        console.log(`${lastProvider} sign-up result:`, {
          providerId: result.providerId,
          uid: result.user?.uid,
          email: result.user?.email,
          displayName: result.user?.displayName,
        });
        setStatusType("success");
        setStatusText(`Success (${lastProvider})`);
        window.sessionStorage.removeItem(AUTH_ATTEMPT_KEY);
        window.sessionStorage.removeItem(LAST_PROVIDER_KEY);
        window.sessionStorage.removeItem("authDebugLines");
        addDebug(`${lastProvider} redirect result success`);
        router.replace("/dashboard");
      })
      .catch((error) => {
        console.error("Redirect sign-up error:", error);
        addDebug(`Redirect error: ${error?.code || error?.message || "unknown"}`);
        setStatusType("error");
        setStatusText(error?.message || "Authentication failed");
        window.sessionStorage.removeItem(AUTH_ATTEMPT_KEY);
        window.sessionStorage.removeItem(LAST_PROVIDER_KEY);
      })
      .finally(() => setBusy(false));

    return () => unsubscribe();
  }, [router]);

  const startGoogle = async () => {
    if (busy || !ready) {
      return;
    }

    try {
      setBusy(true);
      setStatusType("loading");
      setStatusText("Redirecting with Google...");
      addDebug("Google button clicked");
      const auth = getFirebaseAuth();
      await setPersistence(auth, browserLocalPersistence);
      addDebug("Auth persistence set to local");
      const provider = new GoogleAuthProvider();
      window.sessionStorage.setItem(AUTH_ATTEMPT_KEY, "Google");
      window.sessionStorage.setItem(LAST_PROVIDER_KEY, "Google");
      addDebug("Calling signInWithRedirect for Google");
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Google sign-up start error:", error);
      addDebug(`Google start error: ${error?.code || error?.message || "unknown"}`);
      setStatusType("error");
      setStatusText(error?.message || "Failed to start Google sign-up");
      setBusy(false);
    }
  };

  const startApple = async () => {
    if (busy) {
      return;
    }

    if (APPLE_MOCK_ENABLED) {
      setBusy(true);
      setStatusType("loading");
      setStatusText("Redirecting with Apple (mock)...");
      addDebug("Apple mock button clicked");
      window.sessionStorage.setItem(AUTH_ATTEMPT_KEY, "Apple");
      window.sessionStorage.setItem(LAST_PROVIDER_KEY, "Apple");
      window.location.assign(`${window.location.pathname}?appleMockRedirect=1`);
      return;
    }

    if (!ready) {
      return;
    }

    try {
      setBusy(true);
      setStatusType("loading");
      setStatusText("Redirecting with Apple...");
      addDebug("Apple real button clicked");
      const auth = getFirebaseAuth();
      await setPersistence(auth, browserLocalPersistence);
      const provider = new OAuthProvider("apple.com");
      window.sessionStorage.setItem(AUTH_ATTEMPT_KEY, "Apple");
      window.sessionStorage.setItem(LAST_PROVIDER_KEY, "Apple");
      addDebug("Calling signInWithRedirect for Apple");
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Apple sign-up start error:", error);
      addDebug(`Apple start error: ${error?.code || error?.message || "unknown"}`);
      setStatusType("error");
      setStatusText(error?.message || "Failed to start Apple sign-up");
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Create your account</h1>
        <p className="subtitle">Choose a sign-up method</p>

        <div className="buttonStack">
          <button
            type="button"
            className="authButton googleBtn"
            disabled={busy || !ready}
            onClick={startGoogle}
          >
            Continue with Google
          </button>

          <button
            type="button"
            className="authButton appleBtn"
            disabled={busy || (!ready && !APPLE_MOCK_ENABLED)}
            onClick={startApple}
          >
            Continue with Apple
          </button>
        </div>

        <p className={statusClassName}>{statusText}</p>
        <p className="hint">Redirect flow only, no popup windows.</p>
        <p className="hint">Debug: ready={String(ready)} busy={String(busy)}</p>
        <div className="hint" style={{ marginTop: "8px", maxHeight: "140px", overflow: "auto" }}>
          {debugLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </section>
    </main>
  );
}
