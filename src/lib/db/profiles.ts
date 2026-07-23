import { createAdminClient } from "@/lib/supabase/admin";
import { loyalty } from "@/lib/loyalty";

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  role: "customer" | "admin";
  pearls: number;
  isClubMember: boolean;
  clubJoinedAt: string | null;
}

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: "customer" | "admin";
  pearls: number;
  is_club_member: boolean;
  club_joined_at: string | null;
};

function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    pearls: row.pearls,
    isClubMember: row.is_club_member,
    clubJoinedAt: row.club_joined_at,
  };
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return rowToProfile(data as ProfileRow);
}

export async function joinClub(userId: string, email: string) {
  const supabase = createAdminClient();
  let existing = await getProfileById(userId);

  if (!existing) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: userId, email, role: "customer" })
      .select("*")
      .single();
    if (error) throw error;
    existing = rowToProfile(data as ProfileRow);
  }

  const alreadyMember = existing.isClubMember;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_club_member: true,
      pearls: alreadyMember
        ? existing.pearls
        : existing.pearls + loyalty.welcomeBonus,
      club_joined_at: alreadyMember
        ? existing.clubJoinedAt
        : new Date().toISOString(),
      email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return {
    profile: rowToProfile(data as ProfileRow),
    welcomeBonus: alreadyMember ? 0 : loyalty.welcomeBonus,
  };
}

export async function updatePearls(userId: string, pearls: number) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ pearls, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function addPearls(userId: string, amount: number) {
  const profile = await getProfileById(userId);
  if (!profile) return;
  await updatePearls(userId, profile.pearls + amount);
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ProfileRow[]).map(rowToProfile);
}

export async function getClubMembersCount(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_club_member", true);

  if (error) throw error;
  return count ?? 0;
}
