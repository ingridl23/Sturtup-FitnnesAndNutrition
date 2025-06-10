import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xcqmobkgmdfvckmokeml.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcW1vYmtnbWRmdmNrbW9rZW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzU3NjksImV4cCI6MjA2MzI1MTc2OX0.CCgGv2YlnBP_pDLGRDZs8PluWSlK2qlymSwPcXJZF7U";

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
