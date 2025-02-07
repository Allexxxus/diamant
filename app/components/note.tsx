// components/Note.js
import React from 'react';
import styles from './note.module.css'

const Note = ({ id, title, tagsData }) => {
  return (
    <div key={id} className={styles.noteContainer}>
      <h3 className={styles.noteTitle}>{title}</h3>
      <div className="note-tags">
        {tagsData && tagsData.map((tag, index) => (
          <span key={index} className={styles.noteTag}>{tag.name}</span>
        ))}
      </div>
    </div>
  );
};

export default Note;