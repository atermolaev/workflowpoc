export interface FileDropZoneProps {
  /** Controlled list of files */
  value: File[];
  /** Called when files are added or removed */
  onChange: (files: File[]) => void;
  /** Optional accepted MIME types / extensions, forwarded to <input accept> */
  accept?: string;
}
