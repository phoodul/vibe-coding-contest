export interface SubPlacement {
  conceptId: string;
  conceptLabel: string;
  position: string; // 구역 내 구체적 위치
  story: string;
}

export interface HierarchicalPlacement {
  topicId: string;
  topicLabel: string;
  zoneId: string;
  zoneName: string;
  subPlacements: SubPlacement[];
}

// Legacy flat placement (backward compatibility)
export interface Placement {
  nodeId: string;
  nodeLabel: string;
  nodeDescription?: string;
  subNodes?: { label: string; detail: string }[];
  zoneId: string;
  zoneName: string;
  memoryStory?: string;
}

export interface Palace {
  id: string;
  locationKey: string;
  placements: HierarchicalPlacement[];
  reviewCount: number;
  lastReviewedAt?: string;
}
