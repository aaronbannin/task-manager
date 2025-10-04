"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import AuthForm from "@/components/auth/AuthForm";
import BoardsSidebar from "@/components/boards/BoardsSidebar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface Board {
  id: string;
  name: string;
}

export default function HomePage() {
  const [session, setSession] = useState<any>(null); // State to hold user session
  const [loadingSession, setLoadingSession] = useState(true); // Loading state for initial session check
  const [boards, setBoards] = useState<Board[]>([]); // Boards fetched for this page's content logic
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
      // If signed in, trigger board fetch for the main content
      if (currentSession && _event === "SIGNED_IN") {
        fetchUserBoards();
      } else if (!currentSession) {
        // Clear boards if logged out
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

  // Effect to fetch boards once session is confirmed and not loading
  useEffect(() => {
    if (session && !loadingSession) {
      fetchUserBoards();
    }
  }, [session, loadingSession]); // Re-run when session or its loading status changes

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
        // Re-fetch boards to update the current page's display
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

  // If the user is logged in, render the main application layout
  const firstBoard = boards.length > 0 ? boards[0] : null; // Get the first board to display as default content
  const displayBoardContent = firstBoard && !loadingBoards;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {" "}
      {/* Assumes Toolbar is 64px tall */}
      {/* The BoardsSidebar component is rendered here when logged in */}
      <BoardsSidebar /> {/* This component currently fetches its own data */}
      <main className="flex-1 overflow-auto p-6">
        {loadingBoards ? (
          // Show loading indicator while fetching boards for display
          <div className="flex h-full items-center justify-center">
            <p>Loading your boards...</p>
          </div>
        ) : displayBoardContent ? (
          // If boards exist, display the content of the first board
          <div>
            <h1 className="mb-6 text-3xl font-bold">{firstBoard?.name}</h1>
            {/* Placeholder for the selected board's content */}
            <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <p>
                This is the content for board:{" "}
                <span className="font-semibold">{firstBoard?.name}</span> (ID: {firstBoard?.id}).
              </p>
              <p>
                Here you would display the tasks for this board (e.g., To Do, In Progress, Done
                columns).
              </p>
            </div>
          </div>
        ) : (
          // If no boards exist for the logged-in user, prompt to create one
          <div className="flex h-full flex-col items-center justify-center text-gray-500">
            <p className="mb-4 text-xl">You don't have any boards yet.</p>
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
