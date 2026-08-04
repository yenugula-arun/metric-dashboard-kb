/**
 * Standard API response wrapper.
 * Every service method returns Promise<APIResponse<T>>.
 * UI components check response.success before rendering data.
 */
export interface APIResponse<T> {
  success: boolean
  data:    T | null
  error?:  string
  message?: string
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

/**
 * Standard shape exposed by every data hook.
 */
export interface DataHookResult<T> {
  data:      T | null
  loading:   boolean
  error:     string | null
  refresh:   () => void
}
