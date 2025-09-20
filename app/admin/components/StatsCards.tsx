// app/admin/components/StatsCards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Ticket } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { Guest, InviteToken } from "@/lib/types";

interface StatsCardsProps {
  tokens: InviteToken[];
  guests: Guest[];
}

export function StatsCards({ tokens, guests }: StatsCardsProps) {
  const { t } = useLanguage();

  const attendingGuests = guests.filter((g) => g.attendance === "ATTEND");
  const decliningGuests = guests.filter((g) => g.attendance === "DECLINE");
  const responseRate = tokens.length > 0 ? Math.round((tokens.filter(t => t.isUsed).length / tokens.length) * 100) : 0;


  const stats = [
    { title: t("admin.stats.totalInvites"), value: tokens.length, icon: Ticket },
    { title: t("admin.stats.attendees"), value: attendingGuests.length, icon: Users, color: "text-green-600" },
    { title: t("admin.stats.decliners"), value: decliningGuests.length, icon: Users, color: "text-red-600" },
    { title: t("admin.stats.responseRate"), value: `${responseRate}%`, icon: Users, color: "text-blue-600" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color || ""}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}