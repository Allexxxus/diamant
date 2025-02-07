// post-service.ts
'use server';

import { createClient } from './supabase/server';


////////////////////////createPosts////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

export async function createPost(title: string, tagId: string): Promise<void> {
    const supabase = await createClient();


    const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{ title: title }])
        .select('id')
        .single();

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

//////////////////////getPostsByTag////////////////////////////////////////
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

// // post-service.ts
// 'use server';

// import { createClient } from './supabase/server';


// ////////////////////////createPosts////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////

// export async function createPost(title: string, tagId: string): Promise<void> {
//     const supabase = await createClient();


//     const { data: postData, error: postError } = await supabase
//         .from('posts')
//         .insert([{ title: title }])
//         .select('id')
//         .single();

//     if (postError) {
//         console.error('Error creating post:', postError);
//         throw new Error('Failed to create post');
//     }

//    if(postData && postData.id){
//          const { error: postTagError } = await supabase
//         .from('post_tags')
//         .insert([{ post_id: postData.id, tag_id: tagId }]);

//          if (postTagError) {
//             console.error('Error creating post tag:', postTagError);
//             //Attempt to remove post if tag fails
//              const {error: deleteError} = await supabase
//              .from('posts')
//              .delete()
//              .eq('id', postData.id)

//             if(deleteError){
//                console.error('Error deleting post:', deleteError)
//                 throw new Error('Failed to create post and remove it')
//             }
//              throw new Error('Failed to create post tag');
//           }
//     }
//     else{
//        throw new Error("Post id not found");
//     }


//     console.log('Post and tag relationship created successfully');
// }

// //////////////////////getPostsByTag////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////

// export async function getPostsByTag(tagId: string): Promise<{ id: string; title: string; }[]> {
//     const supabase = await createClient();
  
//     // Recursive function to get all child tag IDs
//     async function getAllChildTagIds(parentId: string): Promise<string[]> {
//       const { data, error } = await supabase
//         .from('tag_relationships')
//         .select('child_id')
//         .eq('parent_id', parentId);
  
//       if (error) {
//         console.error('Error fetching child tags:', error);
//         return []; // Return empty array on error to prevent crashing
//       }
  
//       let childIds: string[] = data.map(item => item.child_id);
  
//       // Recursively fetch children of children
//       for (const childId of childIds) {
//         const grandChildIds = await getAllChildTagIds(childId);
//         childIds = childIds.concat(grandChildIds);
//       }
  
//       return childIds;
//     }
  
//     try {
//       // 1. Get all child tag IDs (including the initial tagId)
//       const childTagIds = await getAllChildTagIds(tagId);
//       const allTagIds = [tagId, ...childTagIds]; // Include the parent tag
  
//       // 2. Fetch posts associated with any of the tag IDs
//       const { data , error } = await supabase
//         .from('post_tags')
//         .select('post_id, posts(id, title)')
//         .in('tag_id', allTagIds); // Use the 'in' operator
  
//       if (error) {
//         console.error('Error fetching posts by tag(s):', error);
//         throw new Error('Failed to fetch posts by tag(s)');
//       }
  
//       // 3. Extract and return posts data (deduplicate posts)
//       const postsMap = new Map<string, { id: string; title: string }>();
  
//       data.forEach(item => {
//         if (item.posts && !postsMap.has(item.posts.id)) { //Property 'id' does not exist on type '{ id: any; title: any; }[]'.ts(2339)
//           postsMap.set(item.posts.id, { // Property 'id' does not exist on type '{ id: any; title: any; }[]'.ts(2339
//             id: item.posts.id, //  Property 'id' does not exist on type '{ id: any; title: any; }[]'.ts(2339
//             title: item.posts.title, // Property 'title' does not exist on type '{ id: any; title: any; }[]'.ts(2339)
//           });
//         }
//       });
  
//       const posts = Array.from(postsMap.values());
  
//       return posts;
  
//     } catch (error: any) {
//       console.error('Error in getPostsByTag:', error);
//       throw error; // Re-throw the error to be handled by the caller
//     }
//   }

