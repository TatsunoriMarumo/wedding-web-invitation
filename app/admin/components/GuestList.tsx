// app/admin/components/GuestList.tsx
"use client";

import { Guest, InvitationToken, GuestAllergy, Allergen } from "@prisma/client";
import { exportGuestsToCsv } from "../actions";

type GuestWithRelations = Guest & {
  invitationToken: InvitationToken | null;
  allergies: (GuestAllergy & { allergen: Allergen })[];
};

export default function GuestList({ guests }: { guests: GuestWithRelations[] }) {

  const handleExport = async () => {
    const csvData = await exportGuestsToCsv();
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'guest_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">参加者一覧</h3>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white py-2 px-5 rounded-xl font-medium hover:bg-green-600 transition-colors"
        >
          CSVエクスポート
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">名前</th>
              <th scope="col" className="px-6 py-3">出欠</th>
              <th scope="col" className="px-6 py-3">アレルギー</th>
              <th scope="col" className="px-6 py-3">連絡先</th>
              <th scope="col" className="px-6 py-3">招待者</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {guest.lastName} {guest.firstName}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    guest.attendance === 'ATTEND'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {guest.attendance === 'ATTEND' ? '出席' : '欠席'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {guest.allergies.map(a => a.allergen.name).join(', ') || 'なし'}
                </td>
                <td className="px-6 py-4">
                    <div>{guest.email}</div>
                    <div>{guest.phone}</div>
                </td>
                <td className="px-6 py-4">{guest.invitationToken?.inviteeName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}