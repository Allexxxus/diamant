import React from 'react';
import styles from './note.module.css';

interface Tag {
  id: string;
  name: string;
}

interface NoteProps {
  id: string;
  title: string;
  tagsData: Tag[];
}

const Note: React.FC<NoteProps> = ({ id, title, tagsData }) => {
  return (
    <div key={id} className={styles.noteContainer}>
      <h3 className={styles.noteTitle}>{title}</h3>
      <div className="note-tags">
        {tagsData &&
          tagsData.map((tag: Tag, index: number) => (
            <span key={index} className={styles.noteTag}>
              {tag.name}
            </span>
          ))}
      </div>
    </div>
  );
};

export default Note;