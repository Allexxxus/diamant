import React from 'react';
import Note from './note';
import styles from './noteGrid.module.css';

interface NoteType {
  id: string;
  title: string;
  tags: {  id: string, name: string;}[]; // Or define a more specific type for your tags
}

interface NotesGridProps {
  notes: NoteType[];
}

const NotesGrid: React.FC<NotesGridProps> = ({ notes }) => {
  return (
    <div className={styles.notesGrid}>
      {notes &&
        notes.map((note: NoteType) => {
          console.log(note);

          return <Note key={note.id} id={note.id} title={note.title} tagsData={note.tags} />;
        })}
    </div>
  );
};

export default NotesGrid;