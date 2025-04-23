// post-service.ts
'use server';

import { createClient } from './supabase/server';



/////////////create Posts from tags tree with one tag//////////////////////
///////////////////////////////////////////////////////////////////////////

export async function createPost(title: string, tagId: string): Promise<void> {
  console.log('createPost function is called!!!!!!!!!!!!!!!!!!!!')

  const supabase = await createClient();

    const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{ title: title }])
        .select('id')
        .single();

      console.log(postData)

    if (postError) {
        console.error('Error creating post:', postError);
        throw new Error('Failed to create post');
    }

   if(postData && postData.id){
         const { error: postTagError } = await supabase
        .from('post_tags')
        .insert([{ post_id: postData.id, tag_id: tagId }]);

         if (postTagError) {
            console.error('Error creating post tag:', postTagError);
            //Attempt to remove post if tag fails
             const {error: deleteError} = await supabase
             .from('posts')
             .delete()
             .eq('id', postData.id)

            if(deleteError){
               console.error('Error deleting post:', deleteError)
                throw new Error('Failed to create post and remove it')
            }
             throw new Error('Failed to create post tag');
          }
    }
    else{
       throw new Error("Post id not found");
    }


    console.log('Post and tag relationship created successfully');
}
///////////create posts from Posts-page with multiple tags/////////////////
///////////////////////////////////////////////////////////////////////////

export async function createPostWithTags(title: string, tagIds: string[]): Promise<void> {
    console.log('Received tagIds:', tagIds);

    // Ensure tagIds is an array, even if potentially empty
    if (!Array.isArray(tagIds)) {
        console.error('tagIds is not an array:', tagIds);
        throw new Error('Invalid input: tagIds must be an array.');
    }

    const supabase = await createClient();

    // 1. Create the post
    const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{ title: title }])
        .select('id')
        .single(); // Get the ID of the newly created post

    if (postError) {
        console.error('Error creating post:', postError);
        throw new Error(`Failed to create post: ${postError.message}`);
    }

    if (!postData || !postData.id) {
        // This case should ideally not happen if insert succeeded without error, but good to check
        console.error('Post created but ID not returned.');
        throw new Error("Post ID not found after creation.");
    }

    const postId = postData.id;
    console.log('Post created successfully with ID:', postId);

    // 2. Prepare data for post_tags insertion (only if there are tags)
    if (tagIds.length > 0) {
        // Map the array of tag IDs to an array of objects for insertion
        const postTagsData = tagIds.map(tagId => ({
            post_id: postId,
            tag_id: tagId
        }));

        console.log('Data to insert into post_tags:', postTagsData);

        // 3. Insert all tag relationships for the post
        const { error: postTagError } = await supabase
            .from('post_tags')
            .insert(postTagsData); // Insert the array of objects

        if (postTagError) {
            console.error('Error creating post tag relationships:', postTagError);

            // Attempt to clean up by deleting the post if tag association fails
            console.log(`Attempting to delete post with ID: ${postId} due to tag insertion failure.`);
            const { error: deleteError } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

            if (deleteError) {
                console.error('CRITICAL: Failed to delete post after tag insertion error:', deleteError);
                // Combine error messages for better context
                throw new Error(`Failed to create post tags (Error: ${postTagError.message}). Additionally, failed to cleanup/delete the post (Error: ${deleteError.message}).`);
            } else {
                 console.log(`Successfully deleted post with ID: ${postId} after tag insertion failure.`);
                 throw new Error(`Failed to create post tag relationships: ${postTagError.message}. The post created initially has been deleted.`);
            }
        }
        console.log('Post and tag relationships created successfully for post ID:', postId);

    } else {
        console.log('No tags provided, skipping post_tags insertion for post ID:', postId);
    }
}

//////////////////////get Posts By Tag from tagsTree///////////////////////
///////////////////////////////////////////////////////////////////////////

export async function getPostsByTag(tagId: string): Promise<{ id: string; title: string; }[]> {
  const supabase = await createClient();
  
    // Recursive function to get all child tag IDs
    async function getAllChildTagIds(parentId: string): Promise<string[]> {
      const { data, error } = await supabase
        .from('tag_relationships')
        .select('child_id')
        .eq('parent_id', parentId);
  
      if (error) {
        console.error('Error fetching child tags:', error);
        return []; // Return empty array on error to prevent crashing
      }
      
      let childIds: string[] = data.map(item => item.child_id);
  
      // Recursively fetch children of children
      for (const childId of childIds) {
        const grandChildIds = await getAllChildTagIds(childId);
        childIds = childIds.concat(grandChildIds);
      }
  
      return childIds;
    }
  
    try {
      // 1. Get all child tag IDs (including the initial tagId)
      const childTagIds = await getAllChildTagIds(tagId);
      const allTagIds = [tagId, ...childTagIds]; // Include the parent tag
  
      // 2. Fetch posts associated with any of the tag IDs
      const { data , error } = await supabase
      .from('post_tags')
      .select('post_id, posts(id, title)')
        .in('tag_id', allTagIds); // Use the 'in' operator
  
      if (error) {
        console.error('Error fetching posts by tag(s):', error);
        throw new Error('Failed to fetch posts by tag(s)');
      }
      
      // 3. Extract and return posts data (deduplicate posts)
      const postsMap = new Map<string, { id: string; title: string }>();
  
      data.forEach(item => {
        if (item.posts && typeof item.posts === 'object' && item.posts !== null && 'id' in item.posts && 'title' in item.posts) {
          const post = item.posts as { id: string; title: string };
          if (!postsMap.has(post.id)) {
            postsMap.set(post.id, {
              id: post.id,
              title: post.title,
            });
          }
        }
      });
  
      const posts = Array.from(postsMap.values());
  
      return posts;
  
    } catch (error: any) {
      console.error('Error in getPostsByTag:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  
  
  ///////////////////////////////delete Posts////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  export async function deletePost(postId: string) {
    'use server'; // Marks this as a server action
    const supabase = await createClient();
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
  
    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }