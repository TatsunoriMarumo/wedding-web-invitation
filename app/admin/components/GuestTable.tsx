// app/admin/components/GuestTable.tsx
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Pencil } from "lucide-react";
import { useLanguage } from "@/app/providers";
import type { Guest } from "@/lib/types";
import GuestEditDialog from "./GuestEditDialog";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { DataTableColumnHeader } from "./DataTableColumnHeader";

/** 型ヘルパ */
type BirthValue = Guest["birthDate"] | null | undefined;

/** unknown を安全に Date へ変換 */
const parseDate = (d: unknown): Date | null => {
  if (d == null) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d === "string" || typeof d === "number") {
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const toIsoDateText = (d: BirthValue) => {
  if (!d) return "";
  const date = d instanceof Date ? d : typeof d === "string" ? new Date(d) : undefined;
  if (!date || isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

const toIsoDateTimeText = (d: unknown) => {
  const date = parseDate(d);
  return date ? date.toISOString().slice(0, 19).replace("T", " ") : "";
};

interface GuestTableProps {
  guests: Guest[];
  onExportClick: () => void;
  onGuestUpdated: (g: Guest) => void;
}

export function GuestTable({ guests, onExportClick, onGuestUpdated }: GuestTableProps) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState<Guest | null>(null);

  const columns: ColumnDef<Guest>[] = useMemo(
    () => [
      {
        id: "fullName",
        meta: { title: t("admin.guests.table.name") },
        enableHiding: false,
        accessorFn: (row) => `${row.lastName ?? ""} ${row.firstName ?? ""}`.trim(),
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("admin.guests.table.name")} />,
        cell: ({ row }) => <span className="font-medium whitespace-nowrap">{row.getValue<string>("fullName")}</span>,
      },
      {
        accessorKey: "email",
        meta: { title: t("admin.guests.table.email") ?? "Email" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("admin.guests.table.email") ?? "Email"} />
        ),
        cell: ({ row }) => <span className="text-sm">{row.original.email || t("admin.guests.table.notRegistered")}</span>,
      },
      {
        accessorKey: "phone",
        meta: { title: t("admin.guests.table.phone") ?? "Phone" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("admin.guests.table.phone") ?? "Phone"} />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.original.phone || t("admin.guests.table.notRegistered")}</span>
        ),
      },
      {
        id: "attendanceText",
        meta: { title: t("admin.guests.table.attendance") },
        accessorFn: (row) =>
          row.attendance === "ATTEND"
            ? (t("admin.guests.table.attend") ?? "出席")
            : row.attendance === "DECLINE"
              ? (t("admin.guests.table.decline") ?? "欠席")
              : "",
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("admin.guests.table.attendance")} />,
        cell: ({ row }) => {
          const a = row.original.attendance;
          const isAttend = a === "ATTEND";
          return (
            <Badge
              variant={isAttend ? "secondary" : "destructive"}
              className={isAttend ? "bg-emerald-500 text-white hover:bg-emerald-500/90 border-transparent" : ""}
            >
              {isAttend ? t("admin.guests.table.attend") : t("admin.guests.table.decline")}
            </Badge>
          );
        },
      },
      {
        id: "allergyText",
        meta: { title: t("admin.guests.table.allergies") },
        accessorFn: (row) =>
          (row.allergies ?? [])
            .map((a) => a.allergen?.name)
            .filter(Boolean)
            .join("、"),
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("admin.guests.table.allergies")} />,
        cell: ({ row }) => {
          const items = (row.original.allergies ?? []).map((a) => a.allergen?.name).filter(Boolean) as string[];
          return items.length ? (
            <div className="text-sm flex flex-wrap gap-1">
              {items.map((name, i) => (
                <Badge key={i} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">{t("admin.guests.table.none")}</span>
          );
        },
      },
      {
        id: "birthdateText",
        meta: { title: t("admin.guests.table.birthdate") },
        accessorFn: (row) => toIsoDateText(row.birthDate),
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("admin.guests.table.birthdate")} />,
        cell: ({ row }) => {
          const iso = row.getValue<string>("birthdateText");
          return <span className="whitespace-nowrap">{iso ? iso.replaceAll("-", "/") : ""}</span>;
        },
      },
      {
        id: "createdAtText",
        meta: { title: t("admin.guests.table.registeredAt") },
        accessorFn: (row) => toIsoDateTimeText(row.createdAt),
        header: ({ column }) => <DataTableColumnHeader column={column} title={t("admin.guests.table.registeredAt")} />,
        cell: ({ row }) => {
          const d = parseDate(row.original.createdAt);
          return <span className="whitespace-nowrap">{d ? d.toLocaleString("ja-JP") : ""}</span>;
        },
      },
      {
        id: "actions",
        meta: { title: t("admin.guests.table.actions") },
        enableSorting: false,
        header: () => <div className="font-bold">{t("admin.guests.table.actions")}</div>,
        cell: ({ row }) => (
          <Button variant="outline" size="sm" onClick={() => setEditing(row.original)}>
            <Pencil className="h-4 w-4 mr-1" />
            {t("admin.guests.editButton")}
          </Button>
        ),
      },
    ],
    [t]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t("admin.guests.title")}</CardTitle>
            <CardDescription>{t("admin.guests.description")}</CardDescription>
          </div>
          <Button onClick={onExportClick} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {t("admin.guests.exportButton")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={guests} />
      </CardContent>

      {editing && (
        <GuestEditDialog
          guest={editing}
          open={!!editing}
          onClose={() => setEditing(null)}
          onUpdated={(g) => {
            onGuestUpdated(g);
            setEditing(null);
          }}
        />
      )}
    </Card>
  );
}
