"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import AuthForm from "@/components/auth/AuthForm";
import BoardsSidebar from "@/components/boards/BoardsSidebar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
// import { Database } from "@/types/dbTypes";
import { Board } from "@/types/manual";

export default function HomePage() {
  const [session, setSession] = useState<any>(null); // State to hold user session
  const [loadingSession, setLoadingSession] = useState(true); // Loading state for initial session check
  const [boards, setBoards] = useState<Board[]>([]); // Boards fetched for this page\'s content logic
  const [loadingBoards, setLoadingBoards] = useState(false); // Loading state for boards data
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Effect to manage user session
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoadingSession(false);
    };

    getSession();

    // Set up real-time listener for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        fetchUserBoards(); // Fetch boards when a session is established
      } else {
        setBoards([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]); // Dependency array includes supabase.auth to ensure listener is correctly managed

  // Function to fetch user's boards
  const fetchUserBoards = async () => {
    setLoadingBoards(true);
    const { data, error } = await supabase
      .from("boards")
      .select("id, name")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching user boards on homepage:", error);
      setBoards([]);
    } else {
      setBoards(data || []);
    }
    setLoadingBoards(false);
  };

  // Handler for creating a new board
  const handleCreateBoard = async () => {
    const newBoardName = prompt("Enter the name for the new board:");
    if (newBoardName && newBoardName.trim() !== "") {
      const { data, error } = await supabase
        .from("boards")
        .insert([{ name: newBoardName.trim() }])
        .select();

      if (error) {
        console.error("Error creating board:", error);
      } else {
        // Re-fetch boards to update the current page\'s display
        fetchUserBoards();
        // Note: BoardsSidebar, if it uses its own real-time listener, will also update automatically.
      }
    }
  };

  // --- Conditional Rendering Logic ---

  if (loadingSession) {
    // Show a loading indicator while checking the session
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p>Loading application...</p>
      </div>
    );
  }

  if (!session) {
    // If no session, show the authentication form
    return <AuthForm />;
  }

  // If the user is logged in, perform further checks
  // At this point, session exists, and loadingSession is false.

  // If user is logged in, render the main application layout
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <BoardsSidebar />
      <main className="flex-1 overflow-auto p-6">
        {loadingBoards ? (
          <div className="flex h-full items-center justify-center">
            <p>Loading your boards...</p>
          </div>
        ) : boards.length > 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <p className="mb-4 text-xl">Select a board from the sidebar to view its tasks.</p>
            <p className="text-sm">
              Or create a new board if you don't see what you're looking for.
            </p>
          </div>
        ) : (
          // boards.length === 0
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <p className="mb-4 text-xl">You do not have any boards yet.</p>
            <Button onClick={handleCreateBoard} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Your First Board
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
