// app/admin/components/GuestTable.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Pencil } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { Guest } from "@/lib/types";
import GuestEditDialog from "./GuestEditDialog";

/** birthDate の受け取りを限定して any を排除 */
type BirthdateInput = string | number | Date | null | undefined;

/** birthDate を持つかを安全に判定する type guard */
type HasBirthDate = { birthDate?: BirthdateInput };
const hasBirthDate = (v: unknown): v is HasBirthDate =>
  typeof v === "object" && v !== null && "birthDate" in v;

const formatBirthdate = (bd: BirthdateInput): string => {
  if (!bd) return "";
  if (typeof bd === "string") {
    const m = bd.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[1]}/${m[2]}/${m[3]}` : new Date(bd).toLocaleDateString("ja-JP");
  }
  if (typeof bd === "number") {
    return new Date(bd).toLocaleDateString("ja-JP");
  }
  if (bd instanceof Date) {
    return bd.toLocaleDateString("ja-JP");
  }
  return "";
};

interface GuestTableProps {
  guests: Guest[];
  onExportClick: () => void;
  onGuestUpdated: (g: Guest) => void;
}

export function GuestTable({ guests, onExportClick, onGuestUpdated }: GuestTableProps) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState<Guest | null>(null);

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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">{t("admin.guests.table.name")}</TableHead>
                <TableHead>{t("admin.guests.table.contact")}</TableHead>
                <TableHead>{t("admin.guests.table.attendance")}</TableHead>
                <TableHead>{t("admin.guests.table.allergies")}</TableHead>
                <TableHead>{t("admin.guests.table.birthdate")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("admin.guests.table.registeredAt")}</TableHead>
                <TableHead className="whitespace-nowrap">{t("admin.guests.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {guest.lastName} {guest.firstName}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{guest.email || t("admin.guests.table.notRegistered")}</div>
                      <div className="text-gray-500">{guest.phone || t("admin.guests.table.notRegistered")}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={guest.attendance === "ATTEND" ? "default" : "destructive"}>
                      {guest.attendance === "ATTEND" ? t("admin.guests.table.attend") : t("admin.guests.table.decline")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex flex-wrap gap-1">
                      {guest.allergies.length > 0 ? (
                        guest.allergies.map((allergy, index) => (
                          <Badge key={index} variant="outline">
                            {allergy.allergen.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">{t("admin.guests.table.none")}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {hasBirthDate(guest) ? formatBirthdate(guest.birthDate) : ""}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(guest.createdAt).toLocaleString("ja-JP")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Button variant="outline" size="sm" onClick={() => setEditing(guest)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      {t("admin.guests.editButton")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
