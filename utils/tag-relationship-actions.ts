// tag-relationship-actions.ts
'use server';

import { createClient } from './supabase/server';

export async function createTagAction(tagName: string, parentId: string): Promise<void> {
    const supabase = await createClient();

    // Insert the new tag into the 'tags' table.  Supabase will generate the UUID.
    const { data, error: tagError } = await supabase
        .from('tags')
        .insert([{ name: tagName }])
        .select('id') // Select the newly generated ID

    if (tagError) {
        console.error('Error creating tag:', tagError);
        throw new Error('Failed to create tag in the database');
    }

    // Assuming the insert was successful, extract the new tag's ID
    const newTagId = data?.[0]?.id;

    if (!newTagId) {
      console.error('Could not retrieve new tag ID after insertion.');
      throw new Error('Failed to retrieve new tag ID from the database');
    }

    // Insert the tag relationship into the 'tag_relationships' table
    const { error: relationshipError } = await supabase
        .from('tag_relationships')
        .insert([{ parent_id: parentId, child_id: newTagId }]);

    if (relationshipError) {
        console.error('Error creating tag relationship:', relationshipError);
        // If relationship creation fails, you might want to delete the tag you just created
        await supabase.from('tags').delete().eq('id', newTagId);
        throw new Error('Failed to create tag relationship in the database');
    }

    console.log('Tag and relationship created successfully');
}


export async function createTagRelationshipAction(connection: { source: string | null; target: string | null }): Promise<void> {
  const supabase = await createClient();

  if (!connection.source || !connection.target) {
    console.error('Source or target is null');
    return;
  }

  const { error } = await supabase.from('tag_relationships').insert({
    parent_id: connection.source,
    child_id: connection.target,
  });

  if (error) {
    console.error('Error creating relationship:', error);
    throw new Error('Failed to create relationship in the database');
  } else {
    console.log('Relationship created successfully');
  }
}


export async function deleteTagRelationshipAction(connection: { source: string | null; target: string | null }): Promise<void> {
    const supabase = await createClient();
    console.log(connection);

    if (!connection.source || !connection.target) {
      console.error('Source or target is null');
      return;
    }
    
    const { error } = await supabase
        .from('tag_relationships')
        .delete()
        .eq('parent_id', connection.source)
        .eq('child_id', connection.target);

    if (error) {
        console.error('Error deleting relationship:', error);
        throw new Error('Failed to delete relationship from the database');
    } else {
        console.log('Relationship deleted successfully');
    }
}

// // tag-relationship-actions.ts
// 'use server';

// import { createClient } from './supabase/server';
// import { Connection } from "@xyflow/react";

// export async function createTagRelationshipAction(connection: Connection): Promise<void> {
//   const supabase = await createClient();

//   const { error } = await supabase.from('tag_relationships').insert({
//     parent_id: connection.source,
//     child_id: connection.target,
//   });

//   if (error) {
//     console.error('Error creating relationship:', error);
//     throw new Error('Failed to create relationship in the database');
//   } else {
//     console.log('Relationship created successfully');
//   }
// }


// export async function deleteTagRelationshipAction(connection: Connection): Promise<void> {
//     const supabase = await createClient();
//     console.log(connection);
    
//     const { error } = await supabase
//         .from('tag_relationships')
//         .delete()
//         .eq('parent_id', connection.source)
//         .eq('child_id', connection.target);

//     if (error) {
//         console.error('Error deleting relationship:', error);
//         throw new Error('Failed to delete relationship from the database');
//     } else {
//         console.log('Relationship deleted successfully');
//     }
// }