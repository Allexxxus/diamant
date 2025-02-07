// contextMenu.tsx
import React, { useCallback, useState } from 'react';
import { createPost, getPostsByTag } from '@/utils/post-service';
import './ContextMenu.css';
import { createTagAction } from '@/utils/tag-relationship-actions';

interface ContextMenuProps {
    id: string;
    top: number;
    left: number;
    right?: number;
    bottom?: number;
    onClick: () => void;
}

export default function ContextMenu({
    id,
    top,
    left,
    right,
    bottom,
    onClick,
}: ContextMenuProps) {
    const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
    const [isViewPostsModalOpen, setIsViewPostsModalOpen] = useState(false);
    const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [tagName, setTagName] = useState('');
    const [posts, setPosts] = useState<{ id: string; title: string; }[]>([]);

    const handleOpenAddPostModal = useCallback((event) => {
        event.stopPropagation();
        setIsAddPostModalOpen(true);
    }, []);

    const handleCloseAddPostModal = useCallback(() => {
        setIsAddPostModalOpen(false);
        setPostTitle('');
    }, []);

    const handleTitleChange = useCallback((e) => {
        setPostTitle(e.target.value);
    }, []);

    const handleAddPost = useCallback(async () => {
        try {
            await createPost(postTitle, id);
            console.log(`Post added to node ${id} with title: ${postTitle}`);
            handleCloseAddPostModal();
        } catch (error) {
            console.error("Failed to create post", error);
            alert("Failed to create post. Please try again.");
        }
    }, [postTitle, id, handleCloseAddPostModal]);

    const handleOpenViewPostsModal = useCallback(async (event) => {
        event.stopPropagation();
        setIsViewPostsModalOpen(true);
        try {
            const postsData = await getPostsByTag(id);
            setPosts(postsData);
        } catch (error) {
            console.error("Failed to fetch posts", error);
            alert("Failed to fetch posts. Please try again.");
            setIsViewPostsModalOpen(false);
        }
    }, [id]);

    const handleCloseViewPostsModal = useCallback(() => {
        setIsViewPostsModalOpen(false);
    }, []);

    // New functions for adding tag
    const handleOpenAddTagModal = useCallback((event) => {
        event.stopPropagation();
        setIsAddTagModalOpen(true);
    }, []);

    const handleCloseAddTagModal = useCallback(() => {
        setIsAddTagModalOpen(false);
        setTagName('');
    }, []);

    const handleTagNameChange = useCallback((e) => {
        setTagName(e.target.value);
    }, []);

    const handleAddTag = useCallback(async () => {
        try {
            await createTagAction(tagName, id); // Pass the parentId
            console.log(`Tag added with name: ${tagName} as child of ${id}`);
            handleCloseAddTagModal();
        } catch (error) {
            console.error("Failed to create tag", error);
            alert("Failed to create tag. Please try again.");
        }
    }, [tagName, id, handleCloseAddTagModal]);


    return (
        <>
            <div
                className="context-menu"
                style={{
                    top, left, right, bottom,
                }}
                onClick={onClick}
            >
                <p>
                    <small>node: {id}</small>
                </p>
                <button onClick={handleOpenAddPostModal}>Add Post</button>
                <button onClick={handleOpenViewPostsModal}>Show All Posts</button>
                <button onClick={handleOpenAddTagModal}>Add Tag</button> {/* New button */}
            </div>

            {isAddPostModalOpen && (
                <div className="modal">
                    <h2>Add New Post</h2>
                    <label htmlFor="postTitle">Post Title:</label>
                    <input
                        type="text"
                        id="postTitle"
                        value={postTitle}
                        onChange={handleTitleChange}
                    />
                    <div className="modal-buttons">
                        <button onClick={handleAddPost}>Add Post</button>
                        <button onClick={handleCloseAddPostModal}>Cancel</button>
                    </div>
                </div>
            )}

            {isViewPostsModalOpen && (
                <div className="modal" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    <h2>Posts with Tag: {id}</h2>
                    {posts.length > 0 ? (
                        <ul>
                            {posts.map((post) => (
                                <li key={post.id}>{post.title}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No posts found for this tag.</p>
                    )}
                    <button onClick={handleCloseViewPostsModal}>Close</button>
                </div>
            )}

            {isAddTagModalOpen && (
                <div className="modal">
                    <h2>Add New Tag</h2>
                    <label htmlFor="tagName">Tag Name:</label>
                    <input
                        type="text"
                        id="tagName"
                        value={tagName}
                        onChange={handleTagNameChange}
                    />
                    <div className="modal-buttons">
                        <button onClick={handleAddTag}>Add Tag</button>
                        <button onClick={handleCloseAddTagModal}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    );
}

// import React, { useCallback, useState } from 'react';
// import { createPost } from '@/utils/post-service';
// import { getPostsByTag } from '@/utils/post-service';
// import './ContextMenu.css'; // Import the CSS file

// interface ContextMenuProps {
//     id: string;
//     top: number;
//     left: number;
//     right?: number;
//     bottom?: number;
//     onClick: () => void;
// }

// export default function ContextMenu({
//     id, // id of the given tag
//     top,
//     left,
//     right,
//     bottom,
//     onClick,
// }: ContextMenuProps) {
//     const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
//     const [isViewPostsModalOpen, setIsViewPostsModalOpen] = useState(false);
//     const [postTitle, setPostTitle] = useState('');
//     const [posts, setPosts] = useState([]);

//     const handleOpenAddPostModal = useCallback((event) => {
//       event.stopPropagation();
//       setIsAddPostModalOpen(true);
//     }, []);

//     const handleCloseAddPostModal = useCallback(() => {
//         setIsAddPostModalOpen(false);
//         setPostTitle('');
//     }, []);

//     const handleTitleChange = useCallback((e) => {
//         setPostTitle(e.target.value);
//     }, []);

//     const handleAddPost = useCallback(async () => {
//         try {
//             await createPost(postTitle, id);
//             console.log(`Post added to node ${id} with title: ${postTitle}`);
//             handleCloseAddPostModal();
//         } catch (error) {
//             console.error("Failed to create post", error);
//             alert("Failed to create post. Please try again.");
//         }
//     }, [postTitle, id, handleCloseAddPostModal]);


//     const handleOpenViewPostsModal = useCallback(async (event) => {
//         event.stopPropagation();
//         setIsViewPostsModalOpen(true);
//         try {
//             const postsData = await getPostsByTag(id);
//             setPosts(postsData);
//         } catch (error) {
//             console.error("Failed to fetch posts", error);
//             alert("Failed to fetch posts. Please try again.");
//             setIsViewPostsModalOpen(false);
//         }
//     }, [id]);

//     const handleCloseViewPostsModal = useCallback(() => {
//         setIsViewPostsModalOpen(false);
//     }, []);

//     return (
//         <>
//             <div
//                 className="context-menu"
//                 style={{
//                     top, left, right, bottom, // Keep position-related styles
//                 }}
//                 onClick={onClick}
//             >
//                 <p>
//                     <small>node: {id}</small>
//                 </p>
//                 <button onClick={handleOpenAddPostModal}>Add Post</button>
//                 <button onClick={handleOpenViewPostsModal}>Show All Posts</button>
//             </div>

//             {isAddPostModalOpen && (
//                 <div className="modal">
//                     <h2>Add New Post</h2>
//                     <label htmlFor="postTitle">Post Title:</label>
//                     <input
//                         type="text"
//                         id="postTitle"
//                         value={postTitle}
//                         onChange={handleTitleChange}
//                     />
//                     <div className="modal-buttons">
//                         <button onClick={handleAddPost}>Add Post</button>
//                         <button onClick={handleCloseAddPostModal}>Cancel</button>
//                     </div>
//                 </div>
//             )}

//             {isViewPostsModalOpen && (
//                 <div className="modal" style={{maxHeight: '80vh', overflowY: 'auto'}}>
//                     <h2>Posts with Tag: {id}</h2>
//                     {posts.length > 0 ? (
//                         <ul>
//                             {posts.map((post) => (
//                                 <li key={post.id}>{post.title}</li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p>No posts found for this tag.</p>
//                     )}
//                     <button onClick={handleCloseViewPostsModal}>Close</button>
//                 </div>
//             )}
//         </>
//     );
// }

