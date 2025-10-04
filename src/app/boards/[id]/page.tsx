import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface BoardPageProps {
  params: {
    id: string;
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = params;
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // This case should ideally be handled by middleware or root page redirect,
    // but as a fallback, ensure unauthenticated users don't access board data.
    notFound(); // Or redirect to login
  }

  const { data: board, error } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !board) {
    console.error("Error fetching board:", error);
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Board: {board.name}</h1>
      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">Board Details:</h2>
        <pre className="overflow-x-auto rounded bg-gray-100 p-4 text-sm dark:bg-gray-700">
          {JSON.stringify(board, null, 2)}
        </pre>
      </div>
      {/* This is where tasks and columns will eventually go */}
    </div>
  );
}
