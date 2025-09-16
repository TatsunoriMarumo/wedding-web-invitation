// app/admin/components/TokenTable.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Plus } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { InviteToken } from "@/lib/types";

interface TokenTableProps {
  tokens: InviteToken[];
  onNewClick: () => void;
}

export function TokenTable({ tokens, onNewClick }: TokenTableProps) {
  const { t } = useLanguage();

  const copyTokenUrl = (token: string) => {
    const url = `${window.location.origin}?token=${token}`;
    navigator.clipboard.writeText(url);
    alert("招待URLをクリップボードにコピーしました");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t("admin.tokens.title")}</CardTitle>
            <CardDescription>{t("admin.tokens.description")}</CardDescription>
          </div>
          <Button onClick={onNewClick} className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.tokens.createButton")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.tokens.table.inviteeName")}</TableHead>
                  <TableHead>{t("admin.tokens.table.token")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("admin.tokens.table.createdAt")}</TableHead>
                  <TableHead>{t("admin.tokens.table.status")}</TableHead>
                  <TableHead>{t("admin.tokens.table.action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium whitespace-nowrap">{token.inviteeName}</TableCell>
                    <TableCell className="font-mono text-sm">{token.token}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(token.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell>
                      <Badge variant={token.isUsed ? "default" : "secondary"}>
                        {token.isUsed ? t("admin.tokens.table.used") : t("admin.tokens.table.unused")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => copyTokenUrl(token.token)} className="whitespace-nowrap">
                        <Copy className="h-4 w-4 mr-1" />
                        {t("admin.tokens.table.copyUrl")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}