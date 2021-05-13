/** Raises when a variable is not defined. */
class VariableNotDefinedError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = VariableNotDefinedError.name
  }
}

/** Raises when a variable is defined more than once. */
class DuplicatedVariableError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = DuplicatedVariableError.name
  }
}

/** Raises when indentation is invalid. */
class InvalidIndentationError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = InvalidIndentationError.name
  }
}

/** Raises when file to be parsed does not exist. */
class FileNotFoundError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = FileNotFoundError.name
  }
}

/** Raises when a key is defined more than once. */
class DuplicatedKeyError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = DuplicatedKeyError.name
  }
}

/** Raises when a file is imported more than once. */
class DuplicatedImportError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = DuplicatedImportError.name
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

export {
  loads,
  dumps,
  VariableNotDefinedError,
  DuplicatedVariableError,
  InvalidIndentationError,
  FileNotFoundError,
  DuplicatedKeyError,
  DuplicatedImportError
}
