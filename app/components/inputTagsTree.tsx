'use client'
import React from 'react';

interface Item {
    id: string;
    data: { label: string };
}

interface Relation {
    source: string;
    target: string;
}

interface TagsTreeProps {
    items: Item[];
    relations: Relation[];
    onTagSelect: (tagId: string) => void; // Handler function
}

const InputTagsTree: React.FC<TagsTreeProps> = ({ items, relations, onTagSelect }) => {
    const itemMap = new Map(items.map(item => [item.id, item]));
    const adjacencyList: { [key: string]: string[] } = {};

    // Build adjacency list (parent -> children)
    relations.forEach(edge => {
        if (!adjacencyList[edge.source]) {
            adjacencyList[edge.source] = [];
        }
        adjacencyList[edge.source].push(edge.target);
    });

    const renderTree = (parentId: string | null, indent: number = 0) => {
        if (parentId !== null) {
            const children = Object.entries(adjacencyList).filter(([source, targets]) => targets.includes(parentId));
        }

        if (parentId === null) {
            return Object.keys(adjacencyList).filter(itemId => !relations.some(edge => edge.target === itemId))
                .map(rootItemId => renderItemAndChildren(rootItemId, 0))
        }

        return null;
    }

    const renderItemAndChildren = (itemId: string, indent: number) => {
        const item = itemMap.get(itemId);
        const children = adjacencyList[itemId];

        return (
            <React.Fragment key={itemId}>
                <div
                    style={{ marginLeft: `${indent * 20}px`, cursor: 'pointer' }} // Make clickable
                    onClick={() => onTagSelect(itemId)} // Call handler on click
                >
                    {item?.data.label}
                </div>
                {children && children.map(childId => renderItemAndChildren(childId, indent + 1))}
            </React.Fragment>
        );
    };

    return (
        <div>
            {renderTree(null)}
        </div>
    );
};

export default InputTagsTree;