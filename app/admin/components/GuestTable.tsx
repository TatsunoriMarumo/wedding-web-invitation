// app/admin/components/GuestTable.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { Guest } from "@/lib/types";

interface GuestTableProps {
  guests: Guest[];
  onExportClick: () => void;
}

export function GuestTable({ guests, onExportClick }: GuestTableProps) {
  const { t } = useLanguage();

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
                  <TableHead className="whitespace-nowrap">{t("admin.guests.table.registeredAt")}</TableHead>
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
                    <TableCell className="whitespace-nowrap">{new Date(guest.createdAt).toLocaleString("ja-JP")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}