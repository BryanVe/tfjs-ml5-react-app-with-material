
export const handleAsyncFunctionErrors = async (promise) => {
  try {
    const result = await promise

    return [result, null]
  } catch (error) {
    console.error(error)
    
    return [null, error]
  }
}
