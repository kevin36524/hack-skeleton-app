"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

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

export default function AdminPage() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp");
      if (res.ok) {
        const data = await res.json();
        setRsvps(data.rsvps);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRSVPs = rsvps.filter((r) => {
    if (filter === "all") return true;
    return r.attending === filter;
  });

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
              Navratri Celebration • Oct 11, 2026
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-800/50 hover:bg-orange-700/50 text-orange-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Responses"
              value={stats.totalResponses}
              color="blue"
            />
            <StatCard
              icon={<UserCheck className="w-5 h-5" />}
              label="Attending"
              value={stats.totalAttending}
              color="green"
            />
            <StatCard
              icon={<UserX className="w-5 h-5" />}
              label="Declined"
              value={stats.totalDeclined}
              color="red"
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Adults"
              value={stats.totalAdults}
              color="orange"
            />
            <StatCard
              icon={<Baby className="w-5 h-5" />}
              label="Kids"
              value={stats.totalKids}
              color="purple"
            />
            <StatCard
              icon={<PartyPopper className="w-5 h-5" />}
              label="Total Guests"
              value={stats.totalGuests}
              color="yellow"
            />
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
            filteredRSVPs.map((rsvp) => (
              <div
                key={rsvp.id}
                className={`bg-gradient-to-r ${
                  rsvp.attending === "yes"
                    ? "from-green-900/20 to-emerald-900/10 border-green-700/20"
                    : "from-red-900/20 to-rose-900/10 border-red-700/20"
                } rounded-xl p-4 border`}
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
                      <div className="text-orange-100 font-medium">
                        {rsvp.name}
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
                          {new Date(rsvp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
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
              </div>
            ))
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
    <div
      className={`${colors.bg} rounded-xl p-3 border border-orange-700/20`}
    >
      <div className={`${colors.text} mb-1`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-orange-200/50">{label}</div>
    </div>
  );
}
