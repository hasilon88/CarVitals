import { useState } from 'react'
import { usePythonApi } from '../../hooks/pythonBridge.js'

import styles from './Editor.module.css'

export default function Header() {
  const initialContent = 'Using Python as backend, you can perform operations that are not allowed in Javascript, for example disk access. Click button below to save this content to hard drive.'
  const [content, saveContent] = useState(initialContent)

  const handleSave = async () => {
    try {
      const result = await usePythonApi('car.rpm', null);
      alert(`Python returned: ${result}`);
    } catch (error) {
      alert(`Error calling Python API: ${error.message}`);
    }
  }

  return (
    <div className={styles.editorContainer}>
      <textarea className={styles.textarea} value={content} onChange={(e) => {
        saveContent(e.target.value)
      }}/><br/>

      <button className={styles.button} onClick={handleSave}>
        Save
      </button>
    </div>
  )
}
