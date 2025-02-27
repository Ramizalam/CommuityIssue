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
  // First, get the comments
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  
  // Then, get all unique user_ids
  const userIds = [...new Set(comments.map(c => c.user_id))];
  
  // Fetch user data for these ids from the auth.users table
  // Note: With Supabase, auth user data is often in auth.users, not the public schema
  const { data: users, error: userError } = await supabase
    .from('auth.users') // Try this table name - might need to adjust
    .select('id, email')
    .in('id', userIds);
  
  if (userError) {
    console.warn("Could not fetch users:", userError);
    // If that doesn't work, try a direct auth API call
    try {
      // Get the current user as a fallback
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use the current user's email for their comments
      return comments.map(comment => ({
        ...comment,
        users: { 
          email: comment.user_id === user?.id 
            ? user.email 
            : `User ${comment.user_id.slice(0, 8)}...` 
        }
      }));
    } catch (e) {
      console.error("Failed to get current user:", e);
      return comments.map(comment => ({
        ...comment,
        users: { email: `User ${comment.user_id.slice(0, 8)}...` }
      }));
    }
  }
  
  // Create a map of user_id to email
  const userMap = Object.fromEntries(
    users.map(user => [user.id, user.email || `User ${user.id.slice(0, 8)}`])
  );
  
  // Combine the comments with user emails
  return comments.map(comment => ({
    ...comment,
    users: { 
      email: userMap[comment.user_id] || `User ${comment.user_id.slice(0, 8)}...` 
    }
  }));
}

export async function addComment(issueId: string, content: string) {
  console.log("Getting user...");
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("No authenticated user found");
    throw new Error('You must be logged in to comment');
  }

  console.log("User found, adding comment...");
  const { error, data } = await supabase
    .from('comments')
    .insert({
      content,
      issue_id: issueId,
      user_id: user.id,
    });

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }
  
  console.log("Comment added successfully:", data);
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