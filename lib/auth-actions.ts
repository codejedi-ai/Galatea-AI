"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/sign-in?error=' + encodeURIComponent(error.message))
  }

  redirect('/')
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect('/sign-up?error=' + encodeURIComponent(error.message))
  }

  redirect('/sign-in?message=' + encodeURIComponent('Check your email to confirm your account'))
}

export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
  }

  redirect('/')
}
