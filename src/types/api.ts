export type ApiListMetadata = {
  currentPage: number
  numberOfPages: number
  limit: number
  nextPage?: number
  prevPage?: number
}

export type ApiListResponse<TItem> = {
  results: number
  metadata: ApiListMetadata
  data: TItem[]
}

export type ApiSingleResponse<TItem> = {
  data: TItem
}
