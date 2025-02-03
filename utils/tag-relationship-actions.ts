// tag-relationship-actions.ts
'use server';

import { createClient } from './supabase/server';
import { Connection } from "@xyflow/react";

export async function createTagRelationshipAction(connection: Connection): Promise<void> {
  const supabase = await createClient();

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


export async function deleteTagRelationshipAction(connection: Connection): Promise<void> {
    const supabase = await createClient();
    console.log(connection);
    
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