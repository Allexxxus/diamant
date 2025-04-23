import React from 'react'
import InputTagsTree from './inputTagsTree'
import { getPostsByTag } from '@/utils/post-service'

export default function Filter({tags}) {
  const  handleTagSelect = () => {
    //posts should be fetched somehow
  }
  return (
    <div>
      <InputTagsTree
        relations={tags.relations}
        items={tags.items}
        onTagSelect={handleTagSelect}
      />
    </div>
  )
}
