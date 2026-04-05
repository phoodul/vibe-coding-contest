export interface MindMapSubNode {
  id: string;
  label: string;
  detail: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  description: string;
  subNodes?: MindMapSubNode[];
}

export interface MindMap {
  centerNode: MindMapNode;
  childNodes: MindMapNode[];
}
