import { useState, useRef, useCallback } from "react";
import type { FileDropZoneProps } from "./FileDropZone.types";
import styles from "./FileDropZone.module.css";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropZone({
  value,
  onChange,
  accept,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: File[]) {
    if (!incoming.length) return;
    onChange([...value, ...incoming]);
  }

  function removeFile(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, onChange],
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""} ${value.length ? styles.dropZoneHasFiles : ""}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        aria-label="Загрузить файлы"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className={styles.fileInputHidden}
          onChange={handleInputChange}
          tabIndex={-1}
        />

        {isDragging ? (
          <div className={styles.dropZoneContent}>
            <span className={styles.dropIcon}>⬇</span>
            <span className={styles.dropText}>Отпустите для загрузки</span>
          </div>
        ) : (
          <div className={styles.dropZoneContent}>
            <span className={styles.dropIcon}>📎</span>
            <span className={styles.dropText}>Перетащите файлы сюда</span>
            <span className={styles.dropHint}>или нажмите для выбора</span>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className={styles.fileList}>
          {value.map((file, i) => (
            <div key={i} className={styles.fileItem}>
              <span className={styles.fileIcon}>📄</span>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{formatSize(file.size)}</span>
              </div>
              <button
                className={styles.fileRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                title="Удалить"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
