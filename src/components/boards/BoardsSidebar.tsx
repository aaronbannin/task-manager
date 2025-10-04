"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

interface Board {
  id: string;
  name: string;
}

export default function BoardsSidebar() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBoards();

    const channel = supabase
      .channel("boards_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "boards" }, (payload) => {
        console.log("Change received!", payload);
        fetchBoards(); // Re-fetch boards on any change
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("boards").select("id, name");

    if (error) {
      setError(error.message);
      console.error("Error fetching boards:", error);
    } else {
      setBoards(data || []);
    }
    setLoading(false);
  };

  const handleCreateBoard = async () => {
    const newBoardName = prompt("Enter the name for the new board:");
    if (newBoardName && newBoardName.trim() !== "") {
      const { data, error } = await supabase
        .from("boards")
        .insert([{ name: newBoardName.trim() }])
        .select();

      if (error) {
        setError(error.message);
        console.error("Error creating board:", error);
      } else {
        // No need to manually update state, realtime subscription will handle it
        console.log("New board created:", data);
      }
    }
  };

  if (loading) {
    return (
      <aside className="w-64 border-r bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Boards</h2>
        <p>Loading boards...</p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-64 border-r bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold">Boards</h2>
        <p className="text-red-500">Error: {error}</p>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold">Boards</h2>
      <nav className="space-y-2">
        {boards.length > 0 ? (
          boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {board.name}
            </Link>
          ))
        ) : (
          <p className="text-sm text-gray-500">No boards yet.</p>
        )}
      </nav>
      <Button onClick={handleCreateBoard} className="mt-4 flex w-full items-center gap-2">
        <PlusCircle className="h-4 w-4" />
        Create Board
      </Button>
    </aside>
  );
}
