import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axiosInstance from './axiosInstance'
import type { APIResponse } from '@/types'

/**
 * BaseService — the only class that touches Axios directly.
 * All domain services must extend this class.
 * Never import or call axios outside of this file.
 */
export class BaseService {
  protected readonly http: AxiosInstance = axiosInstance

  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.http.get<T>(url, config)
      return { success: true, data: response.data }
    } catch (err) {
      return this.handleError<T>(err)
    }
  }

  protected async post<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.http.post<T>(url, body, config)
      return { success: true, data: response.data }
    } catch (err) {
      return this.handleError<T>(err)
    }
  }

  protected async put<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.http.put<T>(url, body, config)
      return { success: true, data: response.data }
    } catch (err) {
      return this.handleError<T>(err)
    }
  }

  protected async patch<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.http.patch<T>(url, body, config)
      return { success: true, data: response.data }
    } catch (err) {
      return this.handleError<T>(err)
    }
  }

  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.http.delete<T>(url, config)
      return { success: true, data: response.data }
    } catch (err) {
      return this.handleError<T>(err)
    }
  }

  private handleError<T>(err: unknown): APIResponse<T> {
    if (err instanceof Error) {
      console.error('[BaseService] API Error:', err.message)
      return { success: false, data: null, error: err.message }
    }
    return { success: false, data: null, error: 'An unknown error occurred' }
  }
}
