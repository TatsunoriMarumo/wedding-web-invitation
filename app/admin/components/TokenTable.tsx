// app/admin/components/TokenTable.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/app/providers";
import { InviteToken } from "@/lib/types";
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

interface TokenTableProps {
  tokens: InviteToken[];
  onNewClick: () => void;
  onTokenDeleted: (tokenId: number) => void;
}

export function TokenTable({ tokens, onNewClick, onTokenDeleted }: TokenTableProps) {
  const { t } = useLanguage();
  const [deletingTokenId, setDeletingTokenId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<InviteToken | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const copyTokenUrl = (token: string) => {
    const url = `${window.location.origin}?token=${token}`;
    navigator.clipboard.writeText(url);
    alert("招待URLをクリップボードにコピーしました");
  };

  const handleDeleteClick = (token: InviteToken) => {
    setTokenToDelete(token);
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
    } catch (error) {
      setDeleteError("削除中にエラーが発生しました。");
    } finally {
      setDeletingTokenId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTokenToDelete(null);
    setDeleteError(null);
  };

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
                    <TableCell className="whitespace-nowrap">
                      {new Date(token.createdAt).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={token.isUsed ? "default" : "secondary"}>
                        {token.isUsed ? t("admin.tokens.table.used") : t("admin.tokens.table.unused")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyTokenUrl(token.token)} 
                          className="whitespace-nowrap"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          {t("admin.tokens.table.copyUrl")}
                        </Button>
                        {!token.isUsed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(token)}
                            disabled={deletingTokenId === token.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
              {deleteError && (
                <div className="mt-2 text-red-600 font-medium">
                  {deleteError}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              キャンセル
            </AlertDialogCancel>
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