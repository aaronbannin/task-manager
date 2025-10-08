import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Task } from "@/types/manual";

const supabase = createClientComponentClient();

export const createTask = async (
  title: string,
  description: string,
  status: string,
  boardId: string
) => {
  try {
    const taskData = {
      title,
      description,
      status,
      board_id: boardId,
    };
    console.log("Attempting to create task with data:", taskData);
    const { data, error } = await supabase.from("tasks").insert(taskData).select(); // Added select() to return the created data

    if (error) {
      console.error("Error creating task:", error);
      return { success: false, error };
    }
    console.log("Task created successfully:", data);
    return { success: true, data: data[0] }; // Return the first item if data is an array
  } catch (error) {
    console.error("Unexpected error creating task:", error);
    return { success: false, error };
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  try {
    const { data, error } = await supabase.from("tasks").update(updates).eq("id", taskId).select(); // Added select() to return the updated data

    if (error) {
      console.error("Error updating task:", error);
      return { success: false, error };
    }
    console.log("Task updated successfully:", data);
    return { success: true, data: data[0] }; // Return the first item if data is an array
  } catch (error) {
    console.error("Unexpected error updating task:", error);
    return { success: false, error };
  }
};
