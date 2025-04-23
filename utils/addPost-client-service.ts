import { createClient } from "@/utils/supabase/client";

/////////////////handleAddPost////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////
export async function handleAddPost(title, selectedTags ) {

  const supabase = createClient();

  try {
    // 1. Insert the Post
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert([{ title }])
      .select()
      .single();

    if (postError) {
      console.error("Error inserting post:", postError);
      return;
    }

    const postId = postData.id;

    // 2. Insert into post_tags table (linking post to tags)
    if (selectedTags.length > 0) {
      const postTagsToInsert = selectedTags.map((tagId) => ({
        post_id: postId,
        tag_id: tagId,
      }));

      const { error: postTagsError } = await supabase
        .from("post_tags")
        .insert(postTagsToInsert);

      if (postTagsError) {
        console.error("Error inserting into post_tags:", postTagsError);
        // Consider deleting the post if tag insertion fails to maintain data integrity
        return;
      }
    }

    // If everything is successful:
    console.log("Post inserted successfully:", postData);
  } catch (error) {
    console.error("An unexpected error occurred:", error);
  }
}
