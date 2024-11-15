export const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)

export function isValidDateTime (value) {
  // Regular expression for validating datetime format YYYY-MM-DDTHH:MM:SS.000
  const regex =
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d$/ // 日期時間格式（年-月-日T時:分）

  if (!regex.test(value)) {
    return false
  }

  // Additional check to ensure the date is valid (e.g., no February 30th)
  const datePart = value.split('T')[0] // Extract date part: YYYY-MM-DD
  const [year, month, day] = datePart.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  // Check if the date is valid by comparing it with the input
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
};
