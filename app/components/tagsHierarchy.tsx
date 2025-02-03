'use client'
import { loadTagsHierarchy } from '@/app/actions';
import { useState, useEffect } from 'react';
import TagsGraph from './tagsGraph';

export default function TagsHierarchy() {
    const [tagData, setTagData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTagData = async () => {
            setLoading(true);
            try {
                // const response = await fetch('/actions/tags');
                 const response = await loadTagsHierarchy()
                 console.log(response);
                if (response) {
                    

                    setTagData(response);
                } else {
                    console.error('Failed to fetch tag data');
                }
            } catch (error) {
                console.error('Error fetching tag data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTagData();
    }, []);

    if(loading){
        return <p>Loading tags...</p>
    }

    if (!tagData) {
        return <p>Failed to load tags.</p>;
    }


    return (
        <div>
            {/* Render your graph component using tagData */}
            {/* <pre>{JSON.stringify(tagData, null, 2)}</pre> */}
            <TagsGraph tagData={tagData}/>
        </div>
    );
}