"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { auth, googleProvider, db } from "@/lib/firebase/config";
import {
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  LogIn,
  User as UserIcon,
  Users,
  Baby,
  MessageSquare,
  CheckCircle2,
  XCircle,
  PartyPopper,
  Sparkles,
} from "lucide-react";

type Step = "auth" | "form" | "success";
type Attending = "yes" | "no" | null;

export default function RSVPPage() {
  const [step, setStep] = useState<Step>("auth");
  const [user, setUser] = useState<User | null>(null);
  const [authMethod, setAuthMethod] = useState<"google" | "name">("name");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<Attending>(null);
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [message, setMessage] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalAttending: 0,
    totalAdults: 0,
    totalKids: 0,
    totalGuests: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user?.displayName) {
        setName(user.displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/rsvp/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Silently fail for stats
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setName(result.user.displayName || "");
      setAuthMethod("google");
      setStep("form");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed. Please try again.");
      } else if (firebaseError.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized. Please add it in Firebase Console > Authentication > Settings > Authorized Domains.");
      } else {
        setError("Google sign-in failed. Please try again or use your name.");
      }
    }
    setLoading(false);
  };

  const handleNameSignIn = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInAnonymously(auth);
      setAuthMethod("name");
      setStep("form");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!attending) {
      setError("Please select whether you're attending");
      return;
    }
    if (attending === "yes" && adults < 1) {
      setError("At least 1 adult is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: user?.email || null,
          photoURL: user?.photoURL || null,
          authMethod,
          attending,
          adults: attending === "yes" ? adults : 0,
          kids: attending === "yes" ? kids : 0,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setStep("success");
      fetchStats();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit RSVP");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d1b0e] to-[#1a0a0a]">
      {/* Decorative top border */}
      <div className="h-2 bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600" />

      <div className="max-w-md mx-auto px-4 py-6 pb-12">
        {/* Invite Image */}
        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-orange-900/50 border-2 border-yellow-600/30 mb-6">
          <Image
            src="/navaratri-invite.jpeg"
            alt="Navratri Invitation"
            width={893}
            height={1600}
            className="w-full h-auto"
            priority
          />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gradient-to-br from-orange-900/60 to-red-900/60 rounded-xl p-3 text-center border border-orange-700/30">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.totalAttending}
            </div>
            <div className="text-xs text-orange-200/70 mt-1">Attending</div>
          </div>
          <div className="bg-gradient-to-br from-orange-900/60 to-red-900/60 rounded-xl p-3 text-center border border-orange-700/30">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.totalAdults}
            </div>
            <div className="text-xs text-orange-200/70 mt-1">Adults</div>
          </div>
          <div className="bg-gradient-to-br from-orange-900/60 to-red-900/60 rounded-xl p-3 text-center border border-orange-700/30">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.totalKids}
            </div>
            <div className="text-xs text-orange-200/70 mt-1">Kids</div>
          </div>
        </div>

        {/* RSVP Section */}
        <div className="bg-gradient-to-br from-[#2d1b0e] to-[#1a0a0a] rounded-2xl border border-yellow-600/20 p-6 shadow-xl">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl font-bold text-yellow-400">
                RSVP Now
              </h2>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-orange-200/60 text-sm">
              Let us know if you&apos;ll be joining the celebration!
            </p>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700/50 rounded-lg p-3 mb-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Step: Auth */}
          {step === "auth" && (
            <div className="space-y-4">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Signing in..." : "Sign in with Google"}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-orange-700/30" />
                <span className="text-orange-200/40 text-sm">or</span>
                <div className="flex-1 h-px bg-orange-700/30" />
              </div>

              {/* Name-only Sign In */}
              <div className="space-y-3">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400/50" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNameSignIn()}
                    className="w-full bg-orange-950/50 border border-orange-700/30 rounded-xl py-3.5 pl-10 pr-4 text-orange-100 placeholder-orange-300/30 focus:outline-none focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600/50"
                  />
                </div>
                <button
                  onClick={handleNameSignIn}
                  disabled={loading || !name.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:from-orange-500 hover:to-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  Continue with Name
                </button>
              </div>
            </div>
          )}

          {/* Step: Form */}
          {step === "form" && (
            <div className="space-y-5">
              {/* User greeting */}
              <div className="flex items-center gap-3 bg-orange-950/40 rounded-xl p-3 border border-orange-700/20">
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-orange-100 font-medium">{name}</div>
                  <div className="text-orange-300/50 text-xs">
                    {authMethod === "google" ? "Google Sign-In" : "Guest"}
                  </div>
                </div>
              </div>

              {/* Attending Yes/No */}
              <div>
                <label className="block text-orange-200 text-sm font-medium mb-2">
                  Will you be attending? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAttending("yes")}
                    className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all border-2 ${
                      attending === "yes"
                        ? "bg-green-700/40 border-green-500 text-green-300 shadow-lg shadow-green-900/30"
                        : "bg-orange-950/30 border-orange-700/20 text-orange-300/60 hover:border-green-600/40"
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Yes, I&apos;ll be there!
                  </button>
                  <button
                    onClick={() => setAttending("no")}
                    className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all border-2 ${
                      attending === "no"
                        ? "bg-red-700/40 border-red-500 text-red-300 shadow-lg shadow-red-900/30"
                        : "bg-orange-950/30 border-orange-700/20 text-orange-300/60 hover:border-red-600/40"
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    Sorry, can&apos;t make it
                  </button>
                </div>
              </div>

              {/* Adults & Kids counters - only show if attending */}
              {attending === "yes" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="bg-orange-950/30 rounded-xl p-4 border border-orange-700/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <div className="text-orange-100 font-medium">
                            Adults
                          </div>
                          <div className="text-orange-300/40 text-xs">
                            Ages 13+
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-9 h-9 rounded-full bg-orange-800/50 text-orange-200 flex items-center justify-center text-xl font-bold hover:bg-orange-700/50 transition-colors"
                        >
                          −
                        </button>
                        <span className="text-2xl font-bold text-yellow-400 w-8 text-center">
                          {adults}
                        </span>
                        <button
                          onClick={() => setAdults(Math.min(20, adults + 1))}
                          className="w-9 h-9 rounded-full bg-orange-800/50 text-orange-200 flex items-center justify-center text-xl font-bold hover:bg-orange-700/50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-950/30 rounded-xl p-4 border border-orange-700/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center">
                          <Baby className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <div className="text-orange-100 font-medium">
                            Kids
                          </div>
                          <div className="text-orange-300/40 text-xs">
                            Ages 0-12
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setKids(Math.max(0, kids - 1))}
                          className="w-9 h-9 rounded-full bg-orange-800/50 text-orange-200 flex items-center justify-center text-xl font-bold hover:bg-orange-700/50 transition-colors"
                        >
                          −
                        </button>
                        <span className="text-2xl font-bold text-yellow-400 w-8 text-center">
                          {kids}
                        </span>
                        <button
                          onClick={() => setKids(Math.min(20, kids + 1))}
                          className="w-9 h-9 rounded-full bg-orange-800/50 text-orange-200 flex items-center justify-center text-xl font-bold hover:bg-orange-700/50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-orange-200 text-sm font-medium mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any dietary restrictions or special notes..."
                  rows={3}
                  className="w-full bg-orange-950/50 border border-orange-700/30 rounded-xl py-3 px-4 text-orange-100 placeholder-orange-300/30 focus:outline-none focus:ring-2 focus:ring-yellow-600/50 focus:border-yellow-600/50 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !attending}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold py-4 px-4 rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/30 text-lg"
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <PartyPopper className="w-5 h-5" />
                    Submit RSVP
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-900/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                Thank You!
              </h3>
              <p className="text-orange-200/70 mb-6">
                {attending === "yes"
                  ? `We can't wait to celebrate with you! ${adults} adult${adults > 1 ? "s" : ""}${kids > 0 ? ` and ${kids} kid${kids > 1 ? "s" : ""}` : ""} confirmed.`
                  : "We're sorry you can't make it. You'll be missed!"}
              </p>
              <button
                onClick={() => {
                  setStep("auth");
                  setAttending(null);
                  setAdults(1);
                  setKids(0);
                  setMessage("");
                  setName("");
                  setAuthMethod("name");
                }}
                className="text-orange-400 hover:text-orange-300 text-sm underline"
              >
                Submit another RSVP
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-orange-300/30 text-xs">
          <p>Hosted with ❤️ by Kevin, Niti & Hriyaan</p>
          <p className="mt-1">Sunday, October 11, 2026 • 5:30 PM onwards</p>
        </div>
      </div>
    </div>
  );
}
