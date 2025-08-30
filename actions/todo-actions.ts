"use server";

import { Database } from "types_db";
import { createClient } from "utils/supabase/server";

export type TodoRow = Database["public"]["Tables"]["todo"]["Row"];
export type TodoRowInsert = Database["public"]["Tables"]["todo"]["Insert"];
export type TodoRowUpdate = Database["public"]["Tables"]["todo"]["Update"];

function handleError(error) {
  console.error(error);
  throw new Error(error.message);
}

export async function getTodos({ searchInput = "" }) {
  const supabase = await createClient();
  const { data, error } = await supabase // supabase에서 결과를 줄 때 항상 data와 error를 줌
    .from("todo")
    .select("*")
    .like("title", `%${searchInput}%`)
    .order("created_at", { ascending: true });

  if (error) {
    handleError(error);
  }

  return data;
}

export async function createTodo(todo: TodoRowInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("todo").insert({
    ...todo,
    created_at: new Date().toISOString(),
  });

  if (error) {
    handleError(error);
  }

  return data;
}

export async function updateTodo(todo: TodoRowUpdate) {
  const supabase = await createClient();
  console.log(todo);

  const { data, error } = await supabase
    .from("todo")
    .update({
      ...todo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", todo.id);

  if (error) {
    handleError(error);
  }

  return data;
}

export async function deleteTodo(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("todo").delete().eq("id", id);

  if (error) {
    handleError(error);
  }

  return data;
}
