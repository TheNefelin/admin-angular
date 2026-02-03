export interface ApiResponseModel<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  data: T
}
