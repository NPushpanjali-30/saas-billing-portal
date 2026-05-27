import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://htnntervttmcjcrbxkwp.supabase.co";
const supabaseKey = "sb_publishable_FvASYgk4urtr-v1WjE57JA_JxA_s2Z5";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);