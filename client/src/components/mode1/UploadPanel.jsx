import { useRef, useState } from 'react'

export default function UploadPanel({ onFileSelect }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  function handleFile(f) {
    if (f?.type !== 'application/pdf') return
    setFile(f)
    onFileSelect(f)
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
      className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors
        ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}
    >
      <span className="text-4xl">📄</span>
      {file
        ? <p className="text-sm font-medium text-green-600">{file.name}</p>
        : <p className="text-sm text-gray-500">Drag & drop your resume PDF, or click to browse</p>
      }
      <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  )
}
