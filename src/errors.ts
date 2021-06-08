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

export {
  VariableNotDefinedError,
  DuplicatedVariableError,
  InvalidIndentationError,
  FileNotFoundError,
  DuplicatedKeyError,
  DuplicatedImportError
}
