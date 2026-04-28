import { getApiKeysAction } from './actions'
import { ApiKeysContent } from './api-keys-content'

export default async function ApiKeysPage() {
  const result = await getApiKeysAction()

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Failed to load API keys: {result.error}
        </div>
      </div>
    )
  }

  return <ApiKeysContent initialKeys={result.keys} />
}
