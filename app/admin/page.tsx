"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Baby,
  UserCheck,
  UserX,
  PartyPopper,
  RefreshCw,
  MessageSquare,
  Mail,
  Calendar,
  LogIn,
  LogOut,
  Pencil,
  Trash2,
  Copy,
  ShieldAlert,
} from "lucide-react";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase/config";
import {
  signInWithPopup,
  signOut,
  onIdTokenChanged,
  User,
} from "firebase/auth";

interface RSVP {
  id: string;
  name: string;
  email: string | null;
  photoURL: string | null;
  authMethod: "google" | "name";
  attending: "yes" | "no";
  adults: number;
  kids: number;
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalResponses: number;
  totalAttending: number;
  totalDeclined: number;
  totalAdults: number;
  totalKids: number;
  totalGuests: number;
}

const ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_RSVP_ADMIN_EMAILS || "kevin36524@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");
  const [notice, setNotice] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    attending: "yes" as "yes" | "no",
    adults: 1,
    kids: 0,
    message: "",
  });

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  // Keep a fresh ID token — onIdTokenChanged fires on sign-in and on refresh.
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async (u) => {
      console.log("[admin] auth state:", u
        ? { uid: u.uid, email: u.email, providers: u.providerData.map((p) => p.providerId) }
        : null);
      const t = u ? await u.getIdToken() : null;
      console.log("[admin] id token:", t ? `${t.split(".").length} segments, prefix ${t.slice(0, 12)}...` : null);
      setUser(u);
      setIdToken(t);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = useCallback(async (token: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRsvps(data.rsvps);
        setStats(data.stats);
      } else if (res.status === 401 || res.status === 403) {
        setNotice("Your session expired. Please sign in again.");
        await signOut(getFirebaseAuth());
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (idToken && isAdmin) fetchData(idToken);
  }, [idToken, isAdmin, fetchData]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setNotice("");
    try {
      await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
    } catch (err) {
      const code = (err as { code?: string })?.code;
      console.error("[admin] sign-in error:", code ?? "", err);
      setNotice(code ? `Sign-in failed (${code}). Please try again.` : "Sign-in failed. Please try again.");
    }
    setSigningIn(false);
  };

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
    setRsvps([]);
    setStats(null);
  };

  const handleDelete = async (rsvp: RSVP) => {
    if (!idToken) return;
    if (!window.confirm(`Delete RSVP from ${rsvp.name}?`)) return;
    try {
      const res = await fetch(`/api/rsvp/${rsvp.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        setNotice(`Deleted RSVP from ${rsvp.name}.`);
        fetchData(idToken);
      } else {
        setNotice("Delete failed. Please try again.");
      }
    } catch {
      setNotice("Delete failed. Please try again.");
    }
  };

  const startEdit = (rsvp: RSVP) => {
    setEditingId(rsvp.id);
    setEditForm({
      attending: rsvp.attending,
      adults: rsvp.adults,
      kids: rsvp.kids,
      message: rsvp.message,
    });
  };

  const saveEdit = async (id: string) => {
    if (!idToken) return;
    try {
      const res = await fetch(`/api/rsvp/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingId(null);
        setNotice("RSVP updated.");
        fetchData(idToken);
      } else {
        setNotice("Update failed. Please try again.");
      }
    } catch {
      setNotice("Update failed. Please try again.");
    }
  };

  // Flag RSVPs that share a name or email with another entry (likely duplicates).
  const duplicateOf = (() => {
    const nameCounts = new Map<string, number>();
    const emailCounts = new Map<string, number>();
    for (const r of rsvps) {
      nameCounts.set(norm(r.name), (nameCounts.get(norm(r.name)) || 0) + 1);
      const e = r.email?.trim().toLowerCase();
      if (e) emailCounts.set(e, (emailCounts.get(e) || 0) + 1);
    }
    return (r: RSVP): number => {
      const byName = nameCounts.get(norm(r.name)) || 0;
      const e = r.email?.trim().toLowerCase();
      const byEmail = e ? emailCounts.get(e) || 0 : 0;
      return Math.max(byName, byEmail);
    };
  })();

  const filteredRSVPs = rsvps.filter((r) => {
    if (filter === "all") return true;
    return r.attending === filter;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d1b0e] to-[#1a0a0a] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d1b0e] to-[#1a0a0a] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-gradient-to-br from-[#2d1b0e] to-[#1a0a0a] rounded-2xl border border-yellow-600/20 p-8 text-center shadow-xl">
          <ShieldAlert className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-yellow-400 mb-2">
            Admin Sign In
          </h1>
          <p className="text-orange-200/60 text-sm mb-6">
            Sign in with the admin Google account to manage RSVPs.
          </p>
          {notice && (
            <div className="bg-red-900/40 border border-red-700/50 rounded-lg p-3 mb-4 text-red-200 text-sm">
              {notice}
            </div>
          )}
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 shadow-lg"
          >
            <LogIn className="w-5 h-5" />
            {signingIn ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d1b0e] to-[#1a0a0a] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-gradient-to-br from-[#2d1b0e] to-[#1a0a0a] rounded-2xl border border-red-700/30 p-8 text-center shadow-xl">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-yellow-400 mb-2">
            Access Denied
          </h1>
          <p className="text-orange-200/60 text-sm mb-2">
            Signed in as <span className="text-orange-200">{user.email}</span>
          </p>
          <p className="text-orange-200/40 text-xs mb-6">
            This account doesn&apos;t have admin access.
          </p>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-orange-800/50 hover:bg-orange-700/50 text-orange-200 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d1b0e] to-[#1a0a0a]">
      <div className="h-2 bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600" />

      <div className="max-w-4xl mx-auto px-4 py-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <PartyPopper className="w-6 h-6" />
              RSVP Dashboard
            </h1>
            <p className="text-orange-200/50 text-sm mt-1">
              Navratri Celebration • Oct 11, 2026 • {user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => idToken && fetchData(idToken)}
              disabled={loading}
              className="flex items-center gap-2 bg-orange-800/50 hover:bg-orange-700/50 text-orange-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-orange-950/50 hover:bg-orange-900/50 text-orange-300/70 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

        {notice && (
          <div className="bg-yellow-900/30 border border-yellow-700/40 rounded-lg p-3 mb-4 text-yellow-200 text-sm flex items-center justify-between">
            {notice}
            <button
              onClick={() => setNotice("")}
              className="text-yellow-400/60 hover:text-yellow-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard icon={<Users className="w-5 h-5" />} label="Responses" value={stats.totalResponses} color="blue" />
            <StatCard icon={<UserCheck className="w-5 h-5" />} label="Attending" value={stats.totalAttending} color="green" />
            <StatCard icon={<UserX className="w-5 h-5" />} label="Declined" value={stats.totalDeclined} color="red" />
            <StatCard icon={<Users className="w-5 h-5" />} label="Adults" value={stats.totalAdults} color="orange" />
            <StatCard icon={<Baby className="w-5 h-5" />} label="Kids" value={stats.totalKids} color="purple" />
            <StatCard icon={<PartyPopper className="w-5 h-5" />} label="Total Guests" value={stats.totalGuests} color="yellow" />
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "yes", "no"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === f
                  ? "bg-yellow-600/30 text-yellow-400 border border-yellow-600/50"
                  : "bg-orange-950/30 text-orange-300/50 border border-orange-700/20 hover:text-orange-300"
              }`}
            >
              {f === "all"
                ? `All (${rsvps.length})`
                : f === "yes"
                  ? `Attending (${rsvps.filter((r) => r.attending === "yes").length})`
                  : `Declined (${rsvps.filter((r) => r.attending === "no").length})`}
            </button>
          ))}
        </div>

        {/* RSVP List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-orange-300/50">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              Loading RSVPs...
            </div>
          ) : filteredRSVPs.length === 0 ? (
            <div className="text-center py-12 text-orange-300/50">
              No RSVPs found for this filter.
            </div>
          ) : (
            filteredRSVPs.map((rsvp) => {
              const dupCount = duplicateOf(rsvp);
              const isEditing = editingId === rsvp.id;
              return (
                <div
                  key={rsvp.id}
                  className={`bg-gradient-to-r ${
                    rsvp.attending === "yes"
                      ? "from-green-900/20 to-emerald-900/10 border-green-700/20"
                      : "from-red-900/20 to-rose-900/10 border-red-700/20"
                  } ${dupCount > 1 ? "ring-1 ring-yellow-600/40" : ""} rounded-xl p-4 border`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {rsvp.photoURL ? (
                        <img
                          src={rsvp.photoURL}
                          alt={rsvp.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                          {rsvp.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-100 font-medium">
                            {rsvp.name}
                          </span>
                          {dupCount > 1 && (
                            <span className="flex items-center gap-1 bg-yellow-600/30 text-yellow-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                              <Copy className="w-3 h-3" />
                              Duplicate ×{dupCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-orange-300/50">
                          {rsvp.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {rsvp.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(rsvp.createdAt).toLocaleString()}
                            {rsvp.updatedAt !== rsvp.createdAt && " (edited)"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing && (
                        <>
                          <button
                            onClick={() => startEdit(rsvp)}
                            title="Edit RSVP"
                            className="p-2 rounded-lg bg-orange-800/40 hover:bg-orange-700/50 text-orange-300/70 hover:text-orange-200 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rsvp)}
                            title="Delete RSVP"
                            className="p-2 rounded-lg bg-red-900/40 hover:bg-red-800/50 text-red-300/70 hover:text-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rsvp.attending === "yes"
                            ? "bg-green-600/30 text-green-300"
                            : "bg-red-600/30 text-red-300"
                        }`}
                      >
                        {rsvp.attending === "yes" ? "Attending" : "Declined"}
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-4 ml-13 space-y-4 bg-orange-950/30 rounded-lg p-4 border border-orange-700/20">
                      <div>
                        <label className="block text-orange-200 text-sm font-medium mb-2">
                          Attendance
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() =>
                              setEditForm({ ...editForm, attending: "yes" })
                            }
                            className={`py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                              editForm.attending === "yes"
                                ? "bg-green-700/40 border-green-500 text-green-300"
                                : "bg-orange-950/30 border-orange-700/20 text-orange-300/60"
                            }`}
                          >
                            Attending
                          </button>
                          <button
                            onClick={() =>
                              setEditForm({ ...editForm, attending: "no" })
                            }
                            className={`py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                              editForm.attending === "no"
                                ? "bg-red-700/40 border-red-500 text-red-300"
                                : "bg-orange-950/30 border-orange-700/20 text-orange-300/60"
                            }`}
                          >
                            Declined
                          </button>
                        </div>
                      </div>

                      {editForm.attending === "yes" && (
                        <div className="flex gap-6">
                          <div className="flex items-center gap-3">
                            <span className="text-orange-200 text-sm">Adults</span>
                            <button
                              onClick={() =>
                                setEditForm({ ...editForm, adults: Math.max(1, editForm.adults - 1) })
                              }
                              className="w-8 h-8 rounded-full bg-orange-800/50 text-orange-200 hover:bg-orange-700/50"
                            >
                              −
                            </button>
                            <span className="text-lg font-bold text-yellow-400 w-6 text-center">
                              {editForm.adults}
                            </span>
                            <button
                              onClick={() =>
                                setEditForm({ ...editForm, adults: Math.min(20, editForm.adults + 1) })
                              }
                              className="w-8 h-8 rounded-full bg-orange-800/50 text-orange-200 hover:bg-orange-700/50"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-orange-200 text-sm">Kids</span>
                            <button
                              onClick={() =>
                                setEditForm({ ...editForm, kids: Math.max(0, editForm.kids - 1) })
                              }
                              className="w-8 h-8 rounded-full bg-orange-800/50 text-orange-200 hover:bg-orange-700/50"
                            >
                              −
                            </button>
                            <span className="text-lg font-bold text-yellow-400 w-6 text-center">
                              {editForm.kids}
                            </span>
                            <button
                              onClick={() =>
                                setEditForm({ ...editForm, kids: Math.min(20, editForm.kids + 1) })
                              }
                              className="w-8 h-8 rounded-full bg-orange-800/50 text-orange-200 hover:bg-orange-700/50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-orange-200 text-sm font-medium mb-2">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          Message
                        </label>
                        <textarea
                          value={editForm.message}
                          onChange={(e) =>
                            setEditForm({ ...editForm, message: e.target.value })
                          }
                          rows={2}
                          className="w-full bg-orange-950/50 border border-orange-700/30 rounded-xl py-2.5 px-3 text-orange-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-600/50 resize-none"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => saveEdit(rsvp.id)}
                          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2 px-5 rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-orange-950/50 text-orange-300/70 py-2 px-5 rounded-xl hover:bg-orange-900/50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {rsvp.attending === "yes" && (
                        <div className="flex gap-4 mt-3 ml-13">
                          <span className="text-sm text-orange-200/70">
                            👤 {rsvp.adults} adult{rsvp.adults !== 1 ? "s" : ""}
                          </span>
                          <span className="text-sm text-orange-200/70">
                            👶 {rsvp.kids} kid{rsvp.kids !== 1 ? "s" : ""}
                          </span>
                          <span className="text-sm text-yellow-400 font-medium">
                            Total: {rsvp.adults + rsvp.kids}
                          </span>
                        </div>
                      )}

                      {rsvp.message && (
                        <div className="mt-3 ml-13 flex items-start gap-2 text-sm text-orange-200/60 bg-orange-950/30 rounded-lg p-2">
                          <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                          {rsvp.message}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-600/20", text: "text-blue-400" },
    green: { bg: "bg-green-600/20", text: "text-green-400" },
    red: { bg: "bg-red-600/20", text: "text-red-400" },
    orange: { bg: "bg-orange-600/20", text: "text-orange-400" },
    purple: { bg: "bg-purple-600/20", text: "text-purple-400" },
    yellow: { bg: "bg-yellow-600/20", text: "text-yellow-400" },
  };

  const colors = colorMap[color] || colorMap.orange;

  return (
    <div className={`${colors.bg} rounded-xl p-3 border border-orange-700/20`}>
      <div className={`${colors.text} mb-1`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-orange-200/50">{label}</div>
    </div>
  );
}
