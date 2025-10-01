// app/admin/components/StatsCards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, UserX } from "lucide-react";
import { useLanguage } from "@/app/providers";
import type { Guest } from "@/lib/types";

interface StatsCardsProps {
  guests: Guest[];
}

export function StatsCards({ guests }: StatsCardsProps) {
  const { t } = useLanguage();

  const attendingCount = guests.filter((g) => g.attendance === "ATTEND").length;
  const decliningCount = guests.filter((g) => g.attendance === "DECLINE").length;

  const stats = [
    { title: t("admin.stats.attendees"), value: attendingCount, icon: UserCheck, color: "text-green-600" },
    { title: t("admin.stats.decliners"), value: decliningCount, icon: UserX, color: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
