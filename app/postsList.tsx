'use client'
import React, { useState, useEffect } from 'react';
import AddPost from "./components/addPost";
import NotesGrid from "./components/notesGrid";
import Filter from './components/filter';
// import { tagsType, postType } from '../types'; // Adjust path as needed

interface PostsListProps {
  tags: tagsType;
  posts: postType[];
}

const PostsList: React.FC<PostsListProps> = ({ tags, posts }) => {
  const [showAddPost, setShowAddPost] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  
  const toggleAddPost = () => {
    setShowAddPost(!showAddPost);
  };

  const toggleShowFilter = () => {
    setShowFilter(!showFilter)
  }

  useEffect(() => {
    if (showAddPost) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }

    // Cleanup function to unlock body scroll when the component unmounts (important!)
    return () => {
      unlockBodyScroll();
    };
  }, [showAddPost]);

  const lockBodyScroll = () => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
  };

  const unlockBodyScroll = () => {
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
  };

  return (
    <div>

      <button onClick={toggleShowFilter}>Show Filter</button>
      <button onClick={toggleAddPost}>Add Post</button>
      {showFilter && <Filter tags={tags} />}
      {showAddPost && <AddPost tags={tags} onClose={toggleAddPost} />} {/* Pass onClose */}
      <NotesGrid notes={posts} />
    </div>
  );
};

export default PostsList;

