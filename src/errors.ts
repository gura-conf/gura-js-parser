
/** A Gura error with position, line and custom message. */
class GuraError extends Error {
  /** Global text position where the error occurred. */
  public pos: number
  /** Text line where the error occurred. */
  public line: number
  /** Error message. */
  public message: string

  constructor (pos: number, line: number, message: string) {
    super(`${message} at line ${line} (text position = ${pos})`)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = ParseError.name

    // Public fields
    this.pos = pos
    this.line = line
    this.message = message
  }
}

class ParseError extends GuraError { }

/** Raises when a variable is not defined. */
class VariableNotDefinedError extends GuraError {
  constructor (pos: number, line: number, message: string) {
    super(pos, line, message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = VariableNotDefinedError.name
  }
}

/** Raises when a variable is defined more than once. */
class DuplicatedVariableError extends GuraError {
  constructor (pos: number, line: number, message: string) {
    super(pos, line, message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = DuplicatedVariableError.name
  }
}

/** Raises when indentation is invalid. */
class InvalidIndentationError extends GuraError {
  constructor (pos: number, line: number, message: string) {
    super(pos, line, message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = InvalidIndentationError.name
  }
}

/** Raises when file to be parsed does not exist. */
class FileNotFoundError extends GuraError {
  constructor (pos: number, line: number, message: string) {
    super(pos, line, message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = FileNotFoundError.name
  }
}

/** Raises when a key is defined more than once. */
class DuplicatedKeyError extends GuraError {
  constructor (pos: number, line: number, message: string) {
    super(pos, line, message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = DuplicatedKeyError.name
  }
}

/** Raises when a file is imported more than once. */
class DuplicatedImportError extends GuraError {
  constructor (pos: number, line: number, message: string) {
    super(pos, line, message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = DuplicatedImportError.name
  }
}

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
