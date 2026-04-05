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
  placements: Placement[];
  reviewCount: number;
  lastReviewedAt?: string;
}
