import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovquzgethkugtnxcoeiq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cXV6Z2V0aGt1Z3RueGNvZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Njg5OTEsImV4cCI6MjA3NTA0NDk5MX0.CaIhP9aGNXE-vS9Z7fzF9mq2irOC3TRs92L5qNivm1o';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
