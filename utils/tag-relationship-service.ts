// tag-relationship-service.ts

import { Connection } from "@xyflow/react";

export interface DatabaseService {
    createTagRelationship: (connection: Connection) => Promise<void>;
    deleteTagRelationship: (connection: Connection) => Promise<void>;
}

export async function createTagRelationshipInServer(
    connection: Connection,
    supabase: any
): Promise<void> {

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

export async function deleteTagRelationshipInServer(
    connection: Connection,
    supabase: any
): Promise<void> {

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