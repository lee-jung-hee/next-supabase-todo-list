import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "types_db";

export function createSupabaseAdmin() {
  // 절대 NEXT_PUBLIC_* 쓰지 말 것. 서버 전용 비밀 키여야 함.
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // URL은 공개 가능
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // 비공개 환경변수
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return supabase;
}
