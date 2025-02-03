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

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

interface LayoutedElements {
    nodes: Node[];
    edges: Edge[];
}

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

interface FlowLayoutProps {
    initialNodes: Node[];
    initialEdges: Edge[];
    style?: React.CSSProperties;
}

const FlowLayout: React.FC<FlowLayoutProps> = ({ initialNodes, initialEdges, style }) => {
    const [isClient, setIsClient] = useState(false);
    const edgeReconnectSuccessful = useRef(true);

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


    const onConnect = useCallback(
        async (params: Connection) => {
            // Add the edge to the react flow state
            setEdges((eds) => addEdge({ ...params }, eds));

            try {
                await createTagRelationshipAction(params);
            } catch (error) {
                console.error("Failed to create tag relationship", error);
                setEdges(eds => eds.filter(edge => edge.id !== `${params.source}-${params.target}`));
            }

        },
        [setEdges],
    );


    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeReconnectSuccessful.current = true;
        setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    }, [setEdges]);



    const onEdgeDelete = useCallback(async (edge: Edge) => {
        try {
            await deleteTagRelationshipAction({
                source: edge.source, target: edge.target,
                sourceHandle: null,
                targetHandle: null
            })
        }
        catch (error) {
            console.error("Failed to delete tag relationship", error)
        }
    }, []);

    const onReconnectEnd = useCallback((event: MouseEvent | TouchEvent, edge: Edge) => {
        if (!edgeReconnectSuccessful.current) {
            onEdgeDelete(edge);
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }

        edgeReconnectSuccessful.current = true;
    }, [setEdges, onEdgeDelete]);

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
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnectStart={onReconnectStart}
            onReconnect={onReconnect}
            onReconnectEnd={onReconnectEnd}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            style={{ backgroundColor: "#F7F9FB", ...style }}
        >
            <Panel position="top-right">
                <button onClick={() => onLayout('TB')}>vertical layout</button>
                <button onClick={() => onLayout('LR')}>horizontal layout</button>
            </Panel>
            <Background />
        </ReactFlow>
    );
};

export default FlowLayout;