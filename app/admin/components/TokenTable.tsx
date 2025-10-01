// app/admin/components/TokenTable.tsx
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/app/providers";
import type { InviteToken } from "@/lib/types";
import { deleteInvitationToken } from "@/app/admin/actions";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { DataTableColumnHeader } from "./DataTableColumnHeader";

interface TokenTableProps {
  tokens: InviteToken[];
  onNewClick: () => void;
  onTokenDeleted: (tokenId: number) => void;
}

/** unknown を安全に Date へ変換 */
const parseDate = (d: unknown): Date | null => {
  if (d == null) return null;
  if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
  if (typeof d === "string" || typeof d === "number") {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
};

/** フィルタ/ソートしやすい ISOっぽい文字列 (YYYY-MM-DD HH:mm:ss) を返す */
const toIsoDateTimeText = (d: unknown): string => {
  const dt = parseDate(d);
  return dt ? dt.toISOString().slice(0, 19).replace("T", " ") : "";
};

export function TokenTable({ tokens, onNewClick, onTokenDeleted }: TokenTableProps) {
  const { t } = useLanguage();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTokenId, setDeletingTokenId] = useState<number | null>(null);
  const [tokenToDelete, setTokenToDelete] = useState<InviteToken | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const copyTokenUrl = (token: string) => {
    const url = `${window.location.origin}?token=${token}`;
    navigator.clipboard.writeText(url);
    alert(t("admin.tokens.table.copiedToClipboard") ?? "招待URLをクリップボードにコピーしました");
  };

  const handleDeleteClick = (tok: InviteToken) => {
    setTokenToDelete(tok);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!tokenToDelete) return;
    setDeletingTokenId(tokenToDelete.id);
    try {
      const result = await deleteInvitationToken(tokenToDelete.id);
      if (result.success) {
        onTokenDeleted(tokenToDelete.id);
        setDeleteDialogOpen(false);
        setTokenToDelete(null);
      } else {
        setDeleteError(result.message);
      }
    } catch {
      setDeleteError("削除中にエラーが発生しました。");
    } finally {
      setDeletingTokenId(null);
    }
  };

  const columns: ColumnDef<InviteToken>[] = useMemo(
    () => [
      {
        accessorKey: "inviteeName",
        meta: { title: t("admin.tokens.table.inviteeName") },
        enableHiding: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("admin.tokens.table.inviteeName")} />
        ),
        cell: ({ row }) => <span className="font-medium whitespace-nowrap">{row.original.inviteeName}</span>,
      },
      {
        accessorKey: "token",
        meta: { title: t("admin.tokens.table.token") },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("admin.tokens.table.token")} />
        ),
        cell: ({ row }) => <span className="font-mono text-sm break-all">{row.original.token}</span>,
      },
      {
        id: "createdAtText",
        meta: { title: t("admin.tokens.table.createdAt") },
        accessorFn: (row) => toIsoDateTimeText(row.createdAt),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("admin.tokens.table.createdAt")} />
        ),
        cell: ({ row }) => {
          const d = parseDate(row.original.createdAt);
          return <span className="whitespace-nowrap">{d ? d.toLocaleDateString("ja-JP") : ""}</span>;
        },
      },
      {
        id: "statusText",
        meta: { title: t("admin.tokens.table.status") },
        accessorFn: (row) => (row.isUsed ? (t("admin.tokens.table.used") ?? "使用済み") : (t("admin.tokens.table.unused") ?? "未使用")),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("admin.tokens.table.status")} />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.isUsed ? "default" : "secondary"}>
            {row.original.isUsed ? t("admin.tokens.table.used") : t("admin.tokens.table.unused")}
          </Badge>
        ),
      },
      {
        id: "actions",
        meta: { title: t("admin.tokens.table.action") },
        enableSorting: false,
        header: () => <div className="font-bold">{t("admin.tokens.table.action")}</div>,
        cell: ({ row }) => {
          const tok = row.original;
          return (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copyTokenUrl(tok.token)} className="whitespace-nowrap">
                <Copy className="h-4 w-4 mr-1" />
                {t("admin.tokens.table.copyUrl")}
              </Button>
              {!tok.isUsed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(tok)}
                  disabled={deletingTokenId === tok.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label={t("admin.tokens.table.delete") ?? "削除"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [t, deletingTokenId]
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t("admin.tokens.title")}</CardTitle>
              <CardDescription>{t("admin.tokens.description")}</CardDescription>
            </div>
            <Button
              onClick={onNewClick}
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.tokens.createButton")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={tokens} />
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>トークンの削除確認</AlertDialogTitle>
            <AlertDialogDescription>
              {tokenToDelete && (
                <>
                  「{tokenToDelete.inviteeName}」のトークンを削除しますか？
                  <br />
                  この操作は取り消すことができません。
                </>
              )}
              {deleteError && <div className="mt-2 text-red-600 font-medium">{deleteError}</div>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletingTokenId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingTokenId !== null ? "削除中..." : "削除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
