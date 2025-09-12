// app/admin/page.tsx
import { getGuests } from "./actions";
import GuestList from "./components/GuestList";
import TokenGenerator from "./components/TokenGenerator";

export default async function AdminPage() {
  const guests = await getGuests();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">
            管理者ページ
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <TokenGenerator />
          </div>
          <div className="lg:col-span-2">
            <GuestList guests={guests} />
          </div>
        </div>
      </main>
    </div>
  );
}