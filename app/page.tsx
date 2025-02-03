import PostList from "./components/postList";

import { TagsTree } from "./components/tagsTree";

// import "@/styles/xy-theme.css";
import "@xyflow/react/dist/style.css";

export default function Home() {


  


  return (
    // <div>
    //   Bookmark manager
    //   {/* <TagList />
    // </div>
    <div >
      <PostList />
      <TagsTree />
    </div>

  );
}
