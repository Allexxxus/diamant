import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './addPost.module.css';
import InputTagsTree from './inputTagsTree';
import { createPostWithTags } from '@/utils/post-service';

interface TagItem {
  id: string;
  data: {
    label: string;
  };
}

interface Relation {
  parentId: string | null;
  childId: string;
}

interface tagsType {
  items: TagItem[];
  relations: Relation[];
}

interface AddPostProps {
  tags: tagsType;
  onClose: () => void;
}

interface TitleInputProps {
  title: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function TitleInput({ title, onChange }: TitleInputProps) {
  return (
    <div>
      <input
        type="text"
        id="title"
        value={title}
        placeholder='type a title here'
        onChange={onChange}
        className={styles.input}
      />
    </div>
  );
}

interface SelectedTagsProps {
  selectedTagLabels: string[];
}

function SelectedTags({ selectedTagLabels }: SelectedTagsProps) {
  return (
    <div>
      {selectedTagLabels.length > 0 ? (
        selectedTagLabels.map((label, index) => (
          <span style={{ backgroundColor: 'lightgray', margin: '2px', padding: '2px' }} key={index}>
            {label}
          </span>
        ))
      ) : (
        <p>No tags selected.</p>
      )}
    </div>
  );
}

interface TagSelectionProps {
  items: TagItem[];
  relations: Relation[];
  onTagSelect: (tagId: string) => void;
}

function TagSelection({ items, relations, onTagSelect }: TagSelectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'relative' }}>
      <label
        onClick={toggleOpen}
        style={{ cursor: 'pointer', padding: '5px', border: '1px solid #ccc' }}
      >
        Select Tags:
      </label>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 10,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          width: 'fitContent',
          maxWidth: '300px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <InputTagsTree
            relations={relations}
            items={items}
            onTagSelect={onTagSelect}
          />
        </div>
      )}
    </div>
  );
}

const AddPost: React.FC<AddPostProps> = ({ tags, onClose }) => {
  const [title, setTitle] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const router = useRouter();

  const tagMap = useMemo(() => {
    const map = new Map<string, string>();
    if (tags && tags.items) {
      tags.items.forEach(item => {
        if (item && item.id && item.data && typeof item.data.label === 'string') {
          map.set(item.id, item.data.label);
        }
      });
    }
    return map;
  }, [tags.items]);

  const handleTagSelect = (tagId: string) => {
    setSelectedTagIds((prevIds) => {
      if (prevIds.includes(tagId)) {
        return prevIds.filter((id) => id !== tagId);
      } else {
        return [...prevIds, tagId];
      }
    });
  };

  const handleSubmit = async () => {
    console.log('Adding post with title:', title, 'and tag IDs:', selectedTagIds);
    await createPostWithTags(title, selectedTagIds);
    onClose();
    router.refresh();
  };

  const selectedLabelsForDisplay = selectedTagIds
    .map(id => tagMap.get(id))
    .filter((label): label is string => label !== undefined);

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h3>Add New Post:</h3>

        <TitleInput title={title} onChange={(e) => setTitle(e.target.value)} />

        <div>
          <SelectedTags selectedTagLabels={selectedLabelsForDisplay} />
          <TagSelection
            items={tags.items}
            relations={tags.relations}
            onTagSelect={handleTagSelect}
          />
        </div>

        <button className={`${styles.addPostButton} ${styles.btn}`} onClick={handleSubmit}>Add Post</button>
        <button className={`${styles.cancelButton} ${styles.btn}`} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default AddPost;