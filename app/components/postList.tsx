import { createClient } from "@/utils/supabase/server";
import NotesGrid from "./notesGrid";

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
    data.map(async (post: {id: string, title: string, post_tags: {tag_id: string}[]}) => {
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('id, name')
        .in('id', post.post_tags.map((pt) => pt.tag_id));

        if (tagsError) {
            console.error('Error fetching tags for post:', tagsError);
            return { id: post.id, title: post.title, tags: [] };
          }
      console.log(tagsData);
      
      return { id: post.id, title: post.title, tags: tagsData as Tag[] };
    })
  );


  return postsWithTags as Post[];
}

export default async function PostList() {
  const posts = await getPostsWithTags();

  console.log(posts);
  
  return (
    <div>
      <h2>All Posts with Tags</h2>
      <NotesGrid notes={posts}/>
    </div>
  );
}

// import { createClient } from "@/utils/supabase/server";
// import NotesGrid from "./notesGrid";

// interface Tag {
//   id: string;
//   name: string;
// }

// interface Post {
//   id: string;
//   title: string;
//   tags: Tag[];
// }

// async function getPostsWithTags(): Promise<Post[]> {
//     const supabase = await createClient()


//   const { data, error } = await supabase
//     .from('posts')
//     .select('id, title, post_tags(tag_id)')
//     .order('title');

//     if(error){
//       console.log('Error fetching posts: ', error)
//       return []
//     }

//   const postsWithTags = await Promise.all(
//     data.map(async (post) => {
//       const { data: tagsData, error: tagsError } = await supabase
//         .from('tags')
//         .select('id, name')
//         .in('id', post.post_tags.map((pt) => pt.tag_id));

//         if (tagsError) {
//             console.error('Error fetching tags for post:', tagsError);
//             return { ...post, tags: [] };
//           }
//       console.log(tagsData);
      
//       return { ...post, tags: tagsData as Tag[] };
//     })
//   );


//   return postsWithTags as Post[];
// }

// export default async function PostList() {
//   const posts = await getPostsWithTags();

//   console.log(posts);
  
//   return (
//     <div>
//       <h2>All Posts with Tags</h2>
//       <NotesGrid notes={posts}/>  // Type 'Post[]' is not assignable to type 'NoteType[]'. Type 'Post' is not assignable to type 'NoteType'. Types of property 'tags' are incompatible. Type 'Tag[]' is not assignable to type 'string[]'. Type 'Tag' is not assignable to type 'string'.ts(2322) notesGrid.tsx(12, 3): The expected type comes from property 'notes' which is declared here on type 'IntrinsicAttributes & NotesGridProps'
//     </div>
//   );
// }