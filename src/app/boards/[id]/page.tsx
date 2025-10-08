"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import BoardsSidebar from "@/components/boards/BoardsSidebar";
import { notFound } from "next/navigation";
import { Board, Task } from "@/dbTypes";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createTask, updateTask } from "@/lib/tasks";

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Draggable Task Component
function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2 cursor-grab rounded-md bg-gray-100 p-3 shadow-sm active:shadow-md"
    >
      <h3 className="font-semibold">{task.title}</h3>
      <p className="text-sm text-gray-600">{task.description}</p>
    </div>
  );
}

export default function BoardPage() {
  const params = useParams();
  const boardId = params && typeof params.id === "string" ? params.id : undefined;
  const [board, setBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const supabase = createClientComponentClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchBoardAndTasks = async () => {
      if (!boardId) {
        setLoadingBoard(false);
        setLoadingTasks(false);
        return;
      }

      setLoadingBoard(true);
      setLoadingTasks(true);

      // Fetch board
      const { data: boardData, error: boardError } = await supabase
        .from("boards")
        .select("id, name, description, created_at")
        .eq("id", boardId)
        .single();

      if (boardError) {
        console.error("Error fetching board:", boardError);
        setBoard(null);
      } else {
        setBoard(boardData as Board);
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("board_id", boardId);

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        setTasks([]);
      } else {
        setTasks(tasksData || []);
      }
      setLoadingBoard(false);
      setLoadingTasks(false);
    };

    fetchBoardAndTasks();
  }, [boardId, supabase]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setTasks((items) => {
        const activeTask = items.find((item) => item.id === active.id);
        const newStatus = over.id as Task["status"]; // Assuming over.id is the new status column

        if (activeTask && activeTask.status !== newStatus) {
          // Update the task status locally
          const updatedTasks = items.map((task) =>
            task.id === active.id ? { ...task, status: newStatus } : task
          );
          // Persist the change to the database
          updateTask(activeTask.id, { status: newStatus }); // Removed boardId
          return updatedTasks;
        }
        return items;
      });
    }
  };

  if (loadingBoard || loadingTasks) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p>Loading board and tasks...</p>
      </div>
    );
  }

  if (!board && !loadingBoard) {
    notFound();
  }

  const toDoTasks = tasks.filter((task) => task.status === "To Do");
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress");
  const doneTasks = tasks.filter((task) => task.status === "Done");

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <BoardsSidebar />
      <main className="flex-1 overflow-auto p-6">
        <h1 className="mb-4 text-2xl font-bold">Board: {board?.name}</h1>
        <div className="mb-6">
          <Button
            size="icon"
            onClick={() =>
              boardId && createTask("New Task", "This is a new task description.", "To Do", boardId)
            }
            className="h-10 w-10 text-2xl font-bold"
          >
            +
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>To Do</CardTitle>
              </CardHeader>
              <CardContent>
                <SortableContext
                  items={toDoTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                  id="To Do"
                >
                  {toDoTasks.map((task) => (
                    <DraggableTask key={task.id} task={task} />
                  ))}
                </SortableContext>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <SortableContext
                  items={inProgressTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                  id="In Progress"
                >
                  {inProgressTasks.map((task) => (
                    <DraggableTask key={task.id} task={task} />
                  ))}
                </SortableContext>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Done</CardTitle>
              </CardHeader>
              <CardContent>
                <SortableContext
                  items={doneTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                  id="Done"
                >
                  {doneTasks.map((task) => (
                    <DraggableTask key={task.id} task={task} />
                  ))}
                </SortableContext>
              </CardContent>
            </Card>
          </div>
        </DndContext>
      </main>
    </div>
  );
}
