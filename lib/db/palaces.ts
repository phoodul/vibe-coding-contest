import { createClient } from "@/lib/supabase/client";
import type { MindMap } from "@/types/mindmap";
import type { HierarchicalPlacement } from "@/types/palace";

export interface SavedPalace {
  id: string;
  locationKey: string;
  unitTitle: string;
  subject: string;
  nodeCount: number;
  reviewCount: number;
  createdAt: string;
}

export interface FullPalace extends SavedPalace {
  mindMap: MindMap;
  hierarchicalPlacements: HierarchicalPlacement[];
}

async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function countNodes(placements: HierarchicalPlacement[]): number {
  return placements.reduce((sum, p) => sum + p.subPlacements.length, 0);
}

// === SAVE ===
export async function savePalace(params: {
  locationKey: string;
  unitTitle: string;
  subject: string;
  mindMap: MindMap;
  hierarchicalPlacements: HierarchicalPlacement[];
}): Promise<string> {
  const user = await getUser();
  const nodeCount = countNodes(params.hierarchicalPlacements);
  const createdAt = new Date().toISOString();

  if (!user) {
    const id = crypto.randomUUID();
    const existing = JSON.parse(localStorage.getItem("palaces") || "[]");
    existing.push({
      id,
      locationKey: params.locationKey,
      unitTitle: params.unitTitle,
      subject: params.subject,
      nodeCount,
      reviewCount: 0,
      createdAt,
    });
    localStorage.setItem("palaces", JSON.stringify(existing));
    localStorage.setItem(
      `palace_${id}`,
      JSON.stringify({ id, ...params, nodeCount, reviewCount: 0, createdAt })
    );
    return id;
  }

  const supabase = createClient();

  const { data: mm, error: mmErr } = await supabase
    .from("mind_maps")
    .insert({
      user_id: user.id,
      subject: params.subject,
      unit_title: params.unitTitle,
      nodes: params.mindMap,
    })
    .select("id")
    .single();
  if (mmErr) throw mmErr;

  const { data: palace, error: pErr } = await supabase
    .from("palaces")
    .insert({
      user_id: user.id,
      mind_map_id: mm.id,
      location_key: params.locationKey,
      unit_title: params.unitTitle,
      subject: params.subject,
      placements: params.hierarchicalPlacements,
    })
    .select("id")
    .single();
  if (pErr) throw pErr;

  return palace.id;
}

// === LOAD LIST ===
export async function loadPalaces(): Promise<SavedPalace[]> {
  const user = await getUser();

  if (!user) {
    const saved = localStorage.getItem("palaces");
    return saved ? JSON.parse(saved) : [];
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("palaces")
    .select("id, location_key, unit_title, subject, placements, review_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data || []).map((p) => ({
    id: p.id,
    locationKey: p.location_key,
    unitTitle: p.unit_title,
    subject: p.subject,
    nodeCount: Array.isArray(p.placements)
      ? (p.placements as HierarchicalPlacement[]).reduce(
          (sum, pl) => sum + (pl.subPlacements?.length || 0),
          0
        )
      : 0,
    reviewCount: p.review_count ?? 0,
    createdAt: p.created_at,
  }));
}

// === LOAD DETAIL ===
export async function loadPalace(id: string): Promise<FullPalace | null> {
  const user = await getUser();

  if (!user) {
    const saved = localStorage.getItem(`palace_${id}`);
    return saved ? JSON.parse(saved) : null;
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("palaces")
    .select("*, mind_maps(nodes)")
    .eq("id", id)
    .single();

  if (!data) return null;

  const placements = (data.placements ?? []) as HierarchicalPlacement[];
  return {
    id: data.id,
    locationKey: data.location_key,
    unitTitle: data.unit_title,
    subject: data.subject,
    nodeCount: countNodes(placements),
    reviewCount: data.review_count ?? 0,
    createdAt: data.created_at,
    mindMap: (data.mind_maps as { nodes: MindMap })?.nodes,
    hierarchicalPlacements: placements,
  };
}

// === INCREMENT REVIEW ===
export async function incrementReview(id: string): Promise<number> {
  const user = await getUser();

  if (!user) {
    const saved = localStorage.getItem(`palace_${id}`);
    if (!saved) return 0;
    const palace = JSON.parse(saved);
    palace.reviewCount += 1;
    localStorage.setItem(`palace_${id}`, JSON.stringify(palace));

    const list = JSON.parse(localStorage.getItem("palaces") || "[]");
    const idx = list.findIndex((p: { id: string }) => p.id === id);
    if (idx >= 0) {
      list[idx].reviewCount = palace.reviewCount;
      localStorage.setItem("palaces", JSON.stringify(list));
    }
    return palace.reviewCount;
  }

  const supabase = createClient();
  const { data: current } = await supabase
    .from("palaces")
    .select("review_count")
    .eq("id", id)
    .single();

  const newCount = (current?.review_count ?? 0) + 1;
  await supabase
    .from("palaces")
    .update({ review_count: newCount, last_reviewed_at: new Date().toISOString() })
    .eq("id", id);

  return newCount;
}
