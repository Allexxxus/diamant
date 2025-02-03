import { createClient } from "./supabase/server";
import { Node, Edge } from '@xyflow/react';


interface Tag {
    id: string;
    name: string;
}

interface TagNode extends Tag {
    children: TagNode[];
}

interface Elements {
  nodes: Node[];
  edges: Edge[];
}


async function fetchTagsTree(): Promise<Elements> {
    const supabase = await createClient()

    // Fetch all tags
    const { data: tags, error: tagsError } = await supabase.from('tags').select('id, name');
    if (tagsError) {
        console.error('Error fetching tags:', tagsError);
        return { nodes: [], edges: [] };
    }

    // Fetch all tag relationships
    const { data: relationships, error: relationshipsError } = await supabase
        .from('tag_relationships')
        .select('parent_id, child_id');
    if (relationshipsError) {
        console.error('Error fetching tag relationships:', relationshipsError);
        return { nodes: [], edges: [] };
    }


    const nodes: Node[] = tags.map(tag => ({
        id: tag.id,
        data: { label: tag.name },
        position: { x: 0, y: 0 }
    }));
    
    const edges: Edge[] = relationships.map(relationship => ({
       id: `${relationship.parent_id}-${relationship.child_id}`,
        source: relationship.parent_id,
        target: relationship.child_id
    }))

    
    return { nodes, edges };
}

export default fetchTagsTree
