import { createClient } from "./supabase/server";
import { Node, Edge } from "@xyflow/react";

interface Tag {
  id: string;
  name: string;
}

interface Elements {
  nodes: Node[];
  edges: Edge[];
}

async function fetchTagsTree(): Promise<Elements> {
  const supabase = await createClient();

  // Fetch all tags
  const { data: tags, error: tagsError } = await supabase
    .from("tags")
    .select("id, name");
  if (tagsError) {
    console.error("Error fetching tags:", tagsError);
    return { nodes: [], edges: [] };
  }

  // Fetch all tag relationships
  const { data: relationships, error: relationshipsError } = await supabase
    .from("tag_relationships")
    .select("parent_id, child_id");
  if (relationshipsError) {
    console.error("Error fetching tag relationships:", relationshipsError);
    return { nodes: [], edges: [] };
  }

  const nodes: Node[] = tags.map((tag) => ({
    id: tag.id,
    data: { label: tag.name },
    position: { x: 0, y: 0 },
  }));

  const edges: Edge[] = relationships.map((relationship) => ({
    id: `${relationship.parent_id}-${relationship.child_id}`,
    source: relationship.parent_id,
    target: relationship.child_id,
  }));

  return { nodes, edges };
}

export default fetchTagsTree;

// import { createClient } from "./supabase/server";

// interface Tag {
//     id: string;
//     name: string;
// }

// interface TagNode extends Tag {
//     children: TagNode[];
// }

// async function fetchTagsTree(): Promise<TagNode[]> {
//   const supabase = await createClient()

//   // Fetch all tags
//   const { data: tags, error: tagsError } = await supabase.from('tags').select('id, name');
//   if (tagsError) {
//     console.error('Error fetching tags:', tagsError);
//     return [];
//   }

//   // Fetch all tag relationships
//   const { data: relationships, error: relationshipsError } = await supabase
//   .from('tag_relationships')
//   .select('parent_id, child_id');
//   if(relationshipsError){
//     console.error('Error fetching tag relationships:', relationshipsError);
//     return [];
//     }

//     console.log(tags);
//     console.log(relationships);

//   // Create a map for quick lookups of tags by ID
//   const tagMap = new Map<string, Tag>(tags.map(tag => [tag.id, tag]));

//   // Create a map to store the tree nodes with their children (initialized with empty children lists)
//     const tagNodesMap = new Map<string, TagNode>(tags.map(tag => [tag.id, {...tag, children:[]}]))

//   // Populate the children arrays based on relationships
//   relationships.forEach(relationship => {
//     const parent = tagNodesMap.get(relationship.parent_id);
//       const child = tagNodesMap.get(relationship.child_id);

//     if (parent && child) {
//       parent.children.push(child);
//     }
//   });

//   // Filter out the root tags
//   const rootNodes: TagNode[] = [...tagNodesMap.values()].filter(node => {
//         return !relationships.some(rel => rel.child_id === node.id);
//     })
//     console.log(JSON.stringify(rootNodes));

//   return rootNodes;
// }

// export default fetchTagsTree
