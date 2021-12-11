
/** A Gura error with position, line and custom message. */
class GuraError extends Error {
  /** Global text position where the error occurred. */
  public pos: number
  /** Text line where the error occurred. */
  public line: number
  /** Error message. */
  public message: string

  constructor (pos: number, line: number, message: string) {
    const finalMessage = `${message} at line ${line} (text position = ${pos})`

    super(finalMessage)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = new.target.name

    // Public fields
    this.pos = pos
    this.line = line
    this.message = finalMessage
  }
}

class ParseError extends GuraError {}

/** Raises when a variable is not defined. */
class VariableNotDefinedError extends GuraError {}

/** Raises when a variable is defined more than once. */
class DuplicatedVariableError extends GuraError {}

/** Raises when indentation is invalid. */
class InvalidIndentationError extends GuraError {}

/** Raises when file to be parsed does not exist. */
class FileNotFoundError extends GuraError {}

/** Raises when a key is defined more than once. */
class DuplicatedKeyError extends GuraError {}

/** Raises when a file is imported more than once. */
class DuplicatedImportError extends GuraError {}

export {
  GuraError,
  ParseError,
  VariableNotDefinedError,
  DuplicatedVariableError,
  InvalidIndentationError,
  FileNotFoundError,
  DuplicatedKeyError,
  DuplicatedImportError
}
