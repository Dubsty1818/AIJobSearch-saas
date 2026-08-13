'use server';

import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { z } from 'zod';

// ── Fetch Profile ───────────────────────────────────────────

export async function getUserProfile() {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw new Error(error.message || 'Unknown error');
  return data;
}

// ── Update CV Text ──────────────────────────────────────────

const updateCvSchema = z.object({
  cvText: z.string(),
});

export const updateCvTextAction = authActionClient
  .schema(updateCvSchema)
  .action(async ({ parsedInput: { cvText }, ctx: { userId } }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('user_profiles')
      .update({ cv_text: cvText })
      .eq('id', userId);

    if (error) throw new Error(error.message || 'Unknown error');
    return { success: true };
  });

// ── Update Custom Rules ─────────────────────────────────────

const ruleSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  value: z.number().min(-20).max(20),
});

const updateRulesSchema = z.object({
  rules: z.array(ruleSchema),
});

export const updateCustomRulesAction = authActionClient
  .schema(updateRulesSchema)
  .action(async ({ parsedInput: { rules }, ctx: { userId } }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('user_profiles')
      .update({ custom_rules: rules })
      .eq('id', userId);

    if (error) throw new Error(error.message || 'Unknown error');
    return { success: true };
  });

// ── Update Target Keywords ──────────────────────────────────

const updateKeywordsSchema = z.object({
  keywords: z.string(),
});

export const updateTargetKeywordsAction = authActionClient
  .schema(updateKeywordsSchema)
  .action(async ({ parsedInput: { keywords }, ctx: { userId } }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('user_profiles')
      .update({ target_keywords: keywords })
      .eq('id', userId);

    if (error) throw new Error(error.message || 'Unknown error');
    return { success: true };
  });

// ── Mark Setup Complete ─────────────────────────────────────

export const markSetupCompleteAction = authActionClient
  .schema(z.object({}))
  .action(async ({ ctx: { userId } }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('user_profiles')
      .update({ setup_completed: true })
      .eq('id', userId);

    if (error) throw new Error(error.message || 'Unknown error');
    return { success: true };
  });

// ── Update Max Score Limit ──────────────────────────────────

const updateMaxScoreSchema = z.object({
  limit: z.number().min(10).max(50),
});

export const updateMaxScoreLimitAction = authActionClient
  .schema(updateMaxScoreSchema)
  .action(async ({ parsedInput: { limit }, ctx: { userId } }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('user_profiles')
      .update({ max_score_limit: limit })
      .eq('id', userId);

    if (error) throw new Error(error.message || 'Unknown error');
    return { success: true };
  });

