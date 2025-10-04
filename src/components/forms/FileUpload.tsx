'use client'

interface Props {
  file: File | null
  onFileChange: (file: File | null) => void
}

export function FileUpload({ file, onFileChange }: Props) {
  return (
    <div>
      <label className="label">Beleg (optional)</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-bdp-blue transition-colors">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          {file ? (
            <div>
              <p className="text-bdp-blue font-medium">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  onFileChange(null)
                }}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Datei entfernen
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">
                📎 Klicken zum Hochladen oder Datei hierher ziehen
              </p>
              <p className="text-sm text-gray-500 mt-2">
                PDF, JPG oder PNG (max. 10MB)
              </p>
            </div>
          )}
        </label>
      </div>
    </div>
  )
}
