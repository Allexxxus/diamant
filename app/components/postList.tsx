import { createClient } from "@/utils/supabase/server";

interface Tag {
  id: string;
  name: string;
}

interface Post {
  id: string;
  title: string;
  tags: Tag[];
}

async function getPostsWithTags(): Promise<Post[]> {
    const supabase = await createClient()


  const { data, error } = await supabase
    .from('posts')
    .select('id, title, post_tags(tag_id)')
    .order('title');

    if(error){
      console.log('Error fetching posts: ', error)
      return []
    }

  const postsWithTags = await Promise.all(
    data.map(async (post) => {
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('id, name')
        .in('id', post.post_tags.map((pt) => pt.tag_id));

        if (tagsError) {
            console.error('Error fetching tags for post:', tagsError);
            return { ...post, tags: [] };
          }
      
      return { ...post, tags: tagsData as Tag[] };
    })
  );


  return postsWithTags as Post[];
}

export default async function PostList() {
  const posts = await getPostsWithTags();

  return (
    <div>
      <h2>All Posts with Tags</h2>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px'}}>
            <h3>{post.title}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
              {post.tags.map((tag) => (
                <span key={tag.id} style={{ backgroundColor: '#f0f0f0', padding: '5px', borderRadius: '5px' }}>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>No posts found.</p>
      )}
    </div>
  );
}