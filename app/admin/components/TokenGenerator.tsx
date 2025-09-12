// app/admin/components/TokenGenerator.tsx
"use client";

import { useState } from "react";
import { createInvitationToken } from "../actions";

export default function TokenGenerator() {
  const [inviteeName, setInviteeName] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGeneratedToken("");

    const result = await createInvitationToken(inviteeName);

    if (result.success && result.invitation) {
      const invitationUrl = `${window.location.origin}/?token=${result.invitation.token}`;
      setGeneratedToken(invitationUrl);
      setInviteeName("");
    } else {
      setError(result.message || "エラーが発生しました。");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">
        招待URLを生成
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="inviteeName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            招待者名
          </label>
          <input
            id="inviteeName"
            type="text"
            value={inviteeName}
            onChange={(e) => setInviteeName(e.target.value)}
            placeholder="例：山田 太郎"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-pink-600 transition-colors disabled:bg-gray-300"
        >
          {loading ? "生成中..." : "生成"}
        </button>
      </form>
      {generatedToken && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-700">生成されました！</p>
          <input
            type="text"
            readOnly
            value={generatedToken}
            className="w-full mt-2 p-2 bg-white border rounded"
            onFocus={(e) => e.target.select()}
          />
        </div>
      )}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}