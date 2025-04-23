'use client';

import { deletePost } from "@/utils/post-service";
import { useRouter } from 'next/navigation';


export default function DeleteButton({ postId }: { postId: string }) {
  const router = useRouter();
  async function handleDelete() {
    await deletePost(postId); // Pass the post ID to delete
    router.refresh(); // Refresh the client-side data
  }

  return (
    <span onClick={handleDelete} className="cursor-pointer text-gray-300 hover:text-red-500">
      X
    </span>
  );
}