// flowLayoutWrapper.tsx
import fetchTagsTree from "@/utils/fetchTagsTree-utils";
import FlowLayout from "./FlowLayout";

export async function FlowLayoutWrapper() {
    const data = await fetchTagsTree();
    const initialNodes = data.nodes;
    const initialEdges = data.edges;

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <FlowLayout
                initialNodes={initialNodes}
                initialEdges={initialEdges}
            />
        </div>
    );
}