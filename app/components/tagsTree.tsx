// Example Usage (in a Next.js Server Component or similar):

// import fetchAndStructureTags from './utils/tag-utils'; // Adjust path as needed
import fetchTagsTree from "@/utils/fetchTagsTree-utils";

import FlowLayout from "./FlowLayout";



export async function TagsTree() {
  const data = await fetchTagsTree();
  const initialNodes = data.nodes;
  const initialEdges = data.edges
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <FlowLayout initialNodes={initialNodes} initialEdges={initialEdges} />
    </div>
  );
}