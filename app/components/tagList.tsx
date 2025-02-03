
import { createClient } from "@/utils/supabase/server";

interface Tag {
    id: string;
    name: string;
}

async function getTags(): Promise<Tag[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .order('name'); // Optional: order tags alphabetically

    if (error) {
        console.error('Error fetching tags:', error);
        return [];
    }

    return data as Tag[];
}

export default async function TagList() {
    const tags = await getTags()

    return (
        <div>
            <h2>All Tags</h2>
            <ul>
                {tags.map(tag => (
                    <li key={tag.id}>{tag.name}</li>
                ))}
            </ul>
        </div>
    )
}