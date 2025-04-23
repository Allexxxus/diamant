import { createClient } from "@/utils/supabase/server";

export async function getInitialData() {
    const supabase = await createClient();
  
    try {
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("id, title");
  
      if (postsError) {
        console.error("Error fetching posts:", postsError);
        return { posts: [], tags: { nodes: [], edges: [] } };
      }
  
      // Fetch tags associated with each post
      const postsWithTags = await Promise.all(
        posts.map(async (post) => {
          const { data: postTags, error: postTagsError } = await supabase
            .from("post_tags")
            .select("tag_id")
            .eq("post_id", post.id);
  
          if (postTagsError) {
            console.error(
              `Error fetching tags for post ${post.id}:`,
              postTagsError
            );
            return { ...post, tags: [] }; // Return the post without tags in case of an error for that post.
          }
  
          const tagIds = postTags.map((pt) => pt.tag_id);
  
          if (tagIds.length === 0) {
            return { ...post, tags: [] }; // If no tags are found, return with an empty tags array
          }
  
          const { data: tags, error: tagsError } = await supabase
            .from("tags")
            .select("id, name")
            .in("id", tagIds);
  
          if (tagsError) {
            console.error(
              `Error fetching tag details for post ${post.id}:`,
              tagsError
            );
            return { ...post, tags: [] }; // Return the post without tags in case of an error for that post.
          }
  
          return { ...post, tags: tags };
        })
      );
  
      const { data: tagsData, error: tagsError } = await supabase
        .from("tags")
        .select("id, name")
        .order("name");
  
      if (tagsError) {
        console.error("Error fetching all tags:", tagsError);
        return { posts: [], tags: { nodes: [], edges: [] } };
      }
  
      // Fetch tag relationships
      const { data: tagRelationships, error: tagRelationshipsError } = await supabase
        .from("tag_relationships")
        .select("parent_id, child_id");
  
      if (tagRelationshipsError) {
        console.error("Error fetching tag relationships:", tagRelationshipsError);
        return { posts: [], tags: { nodes: [], edges: [] } };
      }
  
      const items = tagsData.map((tag) => ({
        id: tag.id,
        data: { label: tag.name },
      }));
  
      const relations = tagRelationships.map((relationship) => ({
        source: relationship.parent_id,
        target: relationship.child_id,
      }));
  
      const tags = {
        items,
        relations,
      };
  
      return { posts: postsWithTags, tags: tags };
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      return { posts: [], tags: { items: [], relations: [] } }; // Handle unexpected errors and return empty arrays
    }
  }
