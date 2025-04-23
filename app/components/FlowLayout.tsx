'use client';

import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import {
    Background,
    ReactFlow,
    addEdge,
    ConnectionLineType,
    Panel,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    Position,
    Connection,
    reconnectEdge,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';
import { createTagRelationshipAction, deleteTagRelationshipAction } from '@/utils/tag-relationship-actions';
import { createPost } from '@/utils/post-service';
import ContextMenu from './contextMenu';
import { EdgeBase } from '@xyflow/system';
import AddPost from './addPost';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

interface LayoutedElements {
    nodes: Node[];
    edges: Edge[];
}

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// Layout Calculation Module
// Input: Nodes and Edges arrays, layout direction ('TB' or 'LR')
// Output: New Nodes and Edges arrays with updated positions based on the layout

const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    direction: 'TB' | 'LR' = 'TB',
): LayoutedElements => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const newNode: Node = {
            ...node,
            targetPosition: isHorizontal ? 'left' as Position : 'top' as Position,
            sourcePosition: isHorizontal ? 'right' as Position : 'bottom' as Position,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };

        return newNode;
    });

    return { nodes: newNodes, edges };
};


//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// Edge Connection Management Module
// Input: Connection parameters, old Edge and new Connection parameters, Edge to be deleted
// Output: None (modifies the React Flow state through callbacks)

const useEdgeManagement = (setEdges: any) => {
    const edgeReconnectSuccessful = useRef(true);

    const onConnect = useCallback(
        async (params: Connection) => {
            setEdges((edges: EdgeBase[]) => addEdge({ ...params }, edges));

            try {
                await createTagRelationshipAction(params);
            } catch (error) {
                console.error("Failed to create tag relationship", error);
                setEdges((edges: EdgeBase[]) => edges.filter(edge => edge.id !== `${params.source}-${params.target}`));
            }

        },
        [setEdges],
    );

    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeReconnectSuccessful.current = true;
        setEdges((edges: Edge[]) => reconnectEdge(oldEdge, newConnection, edges));
    }, [setEdges]);

    const onEdgeDelete = useCallback(async (edge: Edge) => {
        try {
            await deleteTagRelationshipAction({
                source: edge.source, target: edge.target
            })
        }
        catch (error) {
            console.error("Failed to delete tag relationship", error)
        }
    }, []);

    const onReconnectEnd = useCallback((event: MouseEvent | TouchEvent, edge: Edge) => {
        if (!edgeReconnectSuccessful.current) {
            onEdgeDelete(edge);
            setEdges((oldEdges: any[]) => oldEdges.filter((e) => e.id !== edge.id));
        }

        edgeReconnectSuccessful.current = true;
    }, [setEdges, onEdgeDelete]);

    return { onConnect, onReconnectStart, onReconnect, onReconnectEnd };
};

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// Context Menu Management Module
// Input: Current state of the nodes in flowlayout
// Output: handlers of event and node context menu, add post button event
const useContextMenuManagement = () => {
    const [menu, setMenu] = useState<any>(null);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const onNodeContextMenu = useCallback(
        (event: any, node: Node) => {
          event.preventDefault();
          const pane = reactFlowWrapper.current?.getBoundingClientRect();
            setMenu({
              id: node.id,
              top: event.clientY < (pane?.height || 0) - 200 && event.clientY,
              left: event.clientX < (pane?.width || 0) - 200 && event.clientX,
              right: event.clientX >= (pane?.width || 0) - 200 && (pane?.width || 0) - event.clientX,
              bottom:
                event.clientY >= (pane?.height || 0) - 200 && (pane?.height || 0) - event.clientY,
            });
          },
        [reactFlowWrapper]
      );
       const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

    const handleAddPost = useCallback(async (nodeId: string) => {
        try{
                await createPost(`New post for ${nodeId}`, nodeId);
                 console.log(`Post added to node ${nodeId}`);
            }
            catch(error){
                console.error("Failed to create post", error)
            }
         setMenu(null)
    }, []);

    return { menu, reactFlowWrapper, onNodeContextMenu, onPaneClick, handleAddPost, setMenu };
};

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
// Main React Flow Component
// Input: Initial nodes and edges, optional style
// Output: React Flow component with layout and interaction logic

interface FlowLayoutProps {
    initialNodes: Node[];
    initialEdges: Edge[];
    style?: React.CSSProperties;
}

const FlowLayout: React.FC<FlowLayoutProps> = ({ initialNodes, initialEdges, style }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
        return getLayoutedElements(
            initialNodes,
            initialEdges,
        );
    }, [initialNodes, initialEdges]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    const { onConnect, onReconnectStart, onReconnect, onReconnectEnd } = useEdgeManagement(setEdges);
    const { menu, reactFlowWrapper, onNodeContextMenu, onPaneClick, handleAddPost, setMenu } = useContextMenuManagement();

    const onLayout = useCallback(
        (direction: 'TB' | 'LR') => {
            const { nodes: layoutedNodes, edges: layoutedEdges } =
                getLayoutedElements(nodes, edges, direction);

            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
        },
        [nodes, edges, setNodes, setEdges],
    );

    if (!isClient) {
        return null;
    }

    return (
        <div style={{ width: "100vw", height: "100vh" }} ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnectStart={onReconnectStart}
                onReconnect={onReconnect}
                onReconnectEnd={onReconnectEnd}
                 onNodeContextMenu={onNodeContextMenu}
                 onPaneClick={onPaneClick}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                style={{ backgroundColor: "#F7F9FB", ...style }}
            >
                  {menu && (
                    <ContextMenu
                        onClick={onPaneClick}
                        {...menu}
                        onAddPost={handleAddPost}
                    />
                )}
                <Panel position="top-right">
                    <button onClick={() => onLayout('TB')}>vertical layout</button>
                    <button onClick={() => onLayout('LR')}>horizontal layout</button>
                </Panel>
                <Background />
            </ReactFlow>
        </div>
    );
};

export default FlowLayout;