"use client";

import { useLanguage } from "../providers"

export default function GiftSection() {
    const { t } = useLanguage();

    return (
        <div className="max-w-3xl mx-auto text-center px-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">{(t("gift.title"))}</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                {(t("gift.subtitle1"))}<br />
                {(t("gift.subtitle2"))}
            </p>
            <div className="bg-white shadow-md w-full rounded-2xl p-6 text-center inline-block">
                <p className="font-semibold text-lg text-gray-800 mb-2">{(t("gift.transfer.title"))}</p>
                <p className="text-gray-700">{(t("gift.transfer.accounts.bankName"))} {(t("gift.transfer.accounts.branchName"))} {(t("gift.transfer.accounts.branchCode"))}</p>
                <p className="text-gray-700">{(t("gift.transfer.accounts.accountType"))} {(t("gift.transfer.accounts.accountNumber"))}</p>
                <p className="text-gray-700">{(t("gift.transfer.accounts.accountHolder"))}</p>
            </div>
            <p className="text-xl font-bold text-red-500 mt-4">
                {(t("gift.deadline.note1"))}<br />
                {(t("gift.deadline.note2"))}
            </p>
        </div>
    );
}
