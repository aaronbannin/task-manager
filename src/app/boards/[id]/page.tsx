"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import BoardsSidebar from "@/components/boards/BoardsSidebar"; // Assuming BoardsSidebar is in this path
import { notFound } from "next/navigation";
import { Board } from "@/types/manual";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;
  const [board, setBoard] = useState<Board | null>(null);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchBoard = async () => {
      if (!boardId) {
        setLoadingBoard(false);
        return;
      }

      setLoadingBoard(true);
      const { data, error } = await supabase
        .from("boards")
        .select("id, name")
        .eq("id", boardId)
        .single(); // Use .single() to get a single record

      if (error) {
        console.error("Error fetching board:", error);
        setBoard(null);
      } else {
        setBoard(data);
      }
      setLoadingBoard(false);
    };

    fetchBoard();
  }, [boardId, supabase]);

  if (loadingBoard) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p>Loading board...</p>
      </div>
    );
  }

  if (!board && !loadingBoard) {
    // If board is null after loading, it means it wasn't found or an error occurred.
    // In a real application, you might show a specific error message or redirect.
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <BoardsSidebar />
      <main className="flex-1 overflow-auto p-6">
        <h1 className="mb-4 text-2xl font-bold">Board: {board?.name}</h1>
        {/* Content for the specific board will go here */}
        <p>Welcome to board "{board?.name}"! Here you will see tasks.</p>
      </main>
    </div>
  );
}
