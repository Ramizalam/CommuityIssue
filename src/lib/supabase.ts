import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  location: string;
  created_at: string;
  user_id: string;
  image_url?: string;
}

export interface Comment {
  id: string;
  content: string;
  issue_id: string;
  user_id: string;
  created_at: string;
  users: {
    email: string;
  };
}

// Modified sign in function with hardcoded admin check
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Check if this is our hardcoded admin
  const isAdmin = email === 'admin123@gmail.com' && password === 'hardwork@12';

  if (isAdmin) {
    // If it's the admin email/password, ensure they have an admin record in the database
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select()
      .eq('user_id', data.user.id);

    // If no admin record exists, create one
    if (!adminError && (!adminData || adminData.length === 0)) {
      await supabase
        .from('admins')
        .insert({ user_id: data.user.id });
    }
  }

  return { user: data.user, isAdmin };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

export async function getIssues(filters?: {
  category?: string;
  status?: Issue['status'];
  search?: string;
}) {
  let query = supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Issue[];
}

export async function updateIssueStatus(id: string, status: Issue['status']) {
  const { error } = await supabase
    .from('issues')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function getComments(issueId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, users(email)')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as (Comment & { users: { email: string } })[];
}

export async function addComment(issueId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('You must be logged in to comment');

  const { error } = await supabase
    .from('comments')
    .insert({
      content,
      issue_id: issueId,
      user_id: user.id,
    });

  if (error) throw error;
  return true;
}

// Function to check if current user is admin
export async function checkIsAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // First check directly
  if (user.email === 'admin123@gmail.com') {
    return true;
  }

  // Then check database
  const { data } = await supabase
    .from('admins')
    .select()
    .eq('user_id', user.id)
    .single();

  return !!data;
}