export interface MindMapNode {
  id: string;
  label: string;
  description: string;
  children?: MindMapNode[];
}

export interface MindMap {
  centerNode: MindMapNode;
  childNodes: MindMapNode[];
}
