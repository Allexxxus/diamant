import React from 'react';
import Note from './note';
import styles from './noteGrid.module.css';

interface NoteType {
  id: string;
  title: string;
  tags: { id: string, name: string }[];
}

interface NotesGridProps {
  notes: NoteType[];
}

const NotesGrid: React.FC<NotesGridProps> = ({ notes }) => {
  return (
    <div className={styles.notesGrid}>
      {notes &&
        notes.map((note: NoteType) => {
          return <Note key={note.id} id={note.id} title={note.title} tagsData={note.tags} />;
        })}
    </div>
  );
};

export default NotesGrid;