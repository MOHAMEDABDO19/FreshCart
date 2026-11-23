const MONGO_OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i

export function isMongoObjectId(value: string): boolean {
  return MONGO_OBJECT_ID_PATTERN.test(value)
}
