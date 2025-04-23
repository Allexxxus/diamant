'use client'




interface SearchProps {
  tags: { id: string; name: string }[];
}

export default function Search({ tags }: SearchProps) {
  return (
    <div>
      <h3>Search by Tag:</h3>
      {tags.map((tag) => (
        <button key={tag.id} style={{margin: '2px'}}>{tag.name}</button>
      ))}
    </div>
  );
}