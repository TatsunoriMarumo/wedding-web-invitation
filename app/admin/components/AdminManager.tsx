"use client";

import { useActionState, useOptimistic } from "react";
import { useFormStatus } from "react-dom";
import {
  addAdminEmail,
  removeAdminEmail,
} from "../actions";
import { type AdminActionState, initialAdminActionState } from "../actions.shared";
import { useLanguage } from "@/app/providers";

type AdminItem = { id: number; email: string; canonical: string };

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="px-3 py-2 rounded-xl border shadow-sm disabled:opacity-50"
    >
      {pending ? "Processing..." : label}
    </button>
  );
}

export default function AdminManager({ initial }: { initial: AdminItem[] }) {
  const { t } = useLanguage();
  const [stateAdd, formActionAdd] = useActionState<AdminActionState, FormData>(
    addAdminEmail,
    initialAdminActionState
  );
  const [stateDel, formActionDel] = useActionState<AdminActionState, FormData>(
    removeAdminEmail,
    initialAdminActionState
  );

  const [optimistic, mutate] = useOptimistic(
    initial,
    (list, action: { type: "add" | "del"; email: string }) => {
      if (action.type === "add" && !list.find((i) => i.email === action.email)) {
        return [...list, { id: Math.random(), email: action.email, canonical: "" }];
      }
      if (action.type === "del") return list.filter((i) => i.email !== action.email);
      return list;
    }
  );

  return (
    <div className="space-y-6">
      {/* 追加フォーム */}
      <form
        action={async (fd) => {
          const email = String(fd.get("email") ?? "").toLowerCase().trim();
          mutate({ type: "add", email });
          return formActionAdd(fd);
        }}
        className="space-y-2"
      >
        <label className="block text-sm font-medium">{t("admin.allowlist.addLabel")}</label>
        <div className="flex gap-2">
          <input
            name="email"
            type="email"
            required
            placeholder="you@gmail.com"
            className="flex-1 px-3 py-2 rounded-xl border"
          />
          <SubmitBtn label={t("admin.common.add")} />
        </div>
        {stateAdd.error && <p className="text-red-600 text-sm">{stateAdd.error}</p>}
        {stateAdd.ok && <p className="text-green-700 text-sm">{t("admin.common.added")}</p>}
      </form>

      {/* 一覧 & 削除 */}
      <div>
        <h3 className="font-semibold mb-2">{t("admin.allowlist.listTitle")}</h3>
        <ul className="divide-y rounded-xl border">
          {optimistic.map((it) => (
            <li key={it.email} className="flex items-center justify-between px-3 py-2">
              <span className="font-mono text-sm">{it.email}</span>
              <form
                action={async (fd) => {
                  mutate({ type: "del", email: it.email });
                  return formActionDel(fd);
                }}
              >
                <input type="hidden" name="email" value={it.email} />
                <SubmitBtn label={t("admin.common.remove")} />
              </form>
            </li>
          ))}
          {optimistic.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">{t("admin.common.none")}</li>
          )}
        </ul>
        {stateDel.error && <p className="text-red-600 text-sm mt-2">{stateDel.error}</p>}
        {stateDel.ok && <p className="text-green-700 text-sm mt-2">{t("admin.common.removed")}</p>}
      </div>

      <p className="text-xs text-gray-600 leading-5">
        {t(
          "admin.allowlist.note",
        )}
      </p>
    </div>
  );
}
