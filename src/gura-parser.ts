/** Raises when a variable is not defined. */
class VariableNotDefinedError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype) // Restore prototype chain
    this.name = VariableNotDefinedError.name // stack traces display correctly now
  }
}

/** Raises when a variable is defined more than once. */
class DuplicatedVariableError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype) // Restore prototype chain
    this.name = DuplicatedVariableError.name // stack traces display correctly now
  }
}

/** Raises when indentation is invalid. */
class InvalidIndentationError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype) // Restore prototype chain
    this.name = InvalidIndentationError.name // stack traces display correctly now
  }
}

/**
 * Parses a text in Gura format.
 * TODO: rename "loads" to "parse".
 *
 * @param text - Text to be parsed.
 * @throws ParseError if the syntax of text is invalid.
 * @returns Dict with all the parsed values.
 */
const loads = (text: string): Object => {
  return {}
}

/**
 * Generates a Gura string from a dictionary(aka.stringify).
 * TODO: rename "dumps" to "dump".
 *
 * @param data - Object to stringify.
 * @returns String with the data in Gura format.
 */
const dumps = (data: Object): string => {
  return ''
}

export { loads, dumps, VariableNotDefinedError, DuplicatedVariableError, InvalidIndentationError }
