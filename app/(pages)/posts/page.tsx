import Filter from "@/app/components/filter";
import PostsList from "@/app/postsList";
import { getInitialData } from "@/utils/service";


export default async function PostsPage() {
  const { posts, tags } = await getInitialData();

  return (
    <div>

      <PostsList posts={posts} tags={tags}/>
    </div>
  );
}


