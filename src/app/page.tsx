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

  // Effect to handle redirection to the first board once boards are loaded and a session exists
  useEffect(() => {
    // Only redirect if a session exists, boards are loaded, and there's at least one board,
    // AND we are currently on the root path to avoid redirect loops if we are already on a board page.
    if (
      session &&
      !loadingSession &&
      !loadingBoards &&
      boards.length > 0 &&
      router.pathname === "/"
    ) {
      router.replace(`/boards/${boards[0].id}`); // Use replace to avoid adding to history
    }
  }, [session, loadingSession, loadingBoards, boards, router]);

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

  // If the user is logged in, perform further checks
  // At this point, session exists, and loadingSession is false.

  if (loadingBoards) {
    // Show a loading indicator while fetching boards if session exists
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p>Loading your boards...</p>
      </div>
    );
  }

  // If boards are loaded and there's at least one board, the useEffect above should trigger a redirect.
  // We show a "Redirecting..." message while waiting for that to happen.
  if (boards.length > 0) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p>Redirecting to your board...</p>
      </div>
    );
  }

  // If user is logged in, boards are loaded, but no boards exist (boards.length === 0)
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <BoardsSidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="flex h-full flex-col items-center justify-center text-gray-500">
          <p className="mb-4 text-xl">You do not have any boards yet.</p>
          <Button onClick={handleCreateBoard} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Your First Board
          </Button>
        </div>
      </main>
    </div>
  );
}
