import CSVPreview from "./components/csv-preview"

export default function PreviewPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Vista Previa del CSV</h1>
      <CSVPreview />
    </div>
  )
}
