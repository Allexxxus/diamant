//tagsField.tsx

'use client'

import { useState } from "react";
import InputTagsTree from "./inputTagsTree";

interface Node {
    id: string;
    data: { label: string };
    position: { x: number; y: number };
}

interface Edge {
    id: string;
    source: string;
    target: string;
}

interface TagsTreeProps {
    initialNodes: Node[];
    initialEdges: Edge[];
}

export default function TagsField({ initialNodes, initialEdges }: TagsTreeProps) {
    const [isInputTagsTreeVisible, setIsInputTagsTreeVisible] = useState(false)

    return (
        <div>
            <button onClick={() => setIsInputTagsTreeVisible(true)}>add tag</button>
            {isInputTagsTreeVisible && <InputTagsTree
                items={initialNodes}
                relations={initialEdges}
            />}
        </div>
    )
}