export interface Placement {
  nodeId: string;
  nodeLabel: string;
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
