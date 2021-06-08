import path from 'path'
import { readFileSync, existsSync } from 'fs'
import { Parser, ParseError } from './parser'
import { DuplicatedImportError, DuplicatedKeyError, DuplicatedVariableError, FileNotFoundError, InvalidIndentationError, VariableNotDefinedError } from './errors'

// Number chars
const BASIC_NUMBERS_CHARS = '0-9'
const HEX_OCT_BIN = 'A-Fa-fxob'
const INF_AND_NAN = 'in' // The rest of the chars are defined in hex_oct_bin
// IMPORTANT: '-' char must be last, otherwise it will be interpreted as a range
const ACCEPTABLE_NUMBER_CHARS = BASIC_NUMBERS_CHARS + HEX_OCT_BIN + INF_AND_NAN + 'Ee+._-'

// Acceptable chars for keys
const KEY_ACCEPTABLE_CHARS = '0-9A-Za-z_'

// Special characters to be escaped
const ESCAPE_SEQUENCES = {
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
  '"': '"',
  '\\': '\\',
  $: '$'
}

/* Data types to be returned by match expression methods */
enum MatchResultType {
  USELESS_LINE,
  PAIR,
  COMMENT,
  IMPORT,
  VARIABLE,
  EXPRESSION,
  PRIMITIVE,
  LIST
}

/* Match expression method's result */
interface MatchResult {
  resultType: MatchResultType
  value?: any
}

class GuraParser extends Parser {
  private variables: Map<string, any>
  private indentationLevels: number[]
  private importedFiles: Set<string>

  constructor () {
    super()

    this.variables = new Map()
    this.indentationLevels = []
    this.importedFiles = new Set()

    this.guraImport = this.guraImport.bind(this)
    this.newLine = this.newLine.bind(this)
    this.comment = this.comment.bind(this)
    this.wsWithIndentation = this.wsWithIndentation.bind(this)
    this.ws = this.ws.bind(this)
    this.quotedStringWithVar = this.quotedStringWithVar.bind(this)
    this.anyType = this.anyType.bind(this)
    this.primitiveType = this.primitiveType.bind(this)
    this.complexType = this.complexType.bind(this)
    this.variableValue = this.variableValue.bind(this)
    this.variable = this.variable.bind(this)
    this.list = this.list.bind(this)
    this.uselessLine = this.uselessLine.bind(this)
    this.expression = this.expression.bind(this)
    this.key = this.key.bind(this)
    this.pair = this.pair.bind(this)
    this.null = this.null.bind(this)
    this.boolean = this.boolean.bind(this)
    this.unquotedString = this.unquotedString.bind(this)
    this.number = this.number.bind(this)
    this.basicString = this.basicString.bind(this)
    this.literalString = this.literalString.bind(this)
  }

  /**
   * Parses a text in Gura format.
   *
   * @param text - Text to be parsed.
   * @throws ParseError if the syntax of text is invalid.
   * @returns Object with all the parsed values.
   */
  parse (text: string): Object {
    this.restartParams(text)
    const result = this.start()
    this.assertEnd()
    return result ?? {}
  }

  /**
   * Sets the params to start parsing from a specific text.
   *
   * @param text - Text to set as the internal text to be parsed.
   */
  private restartParams (text: string) {
    this.text = text
    this.pos = -1
    this.line = 0
    this.len = text.length - 1
  }

  /**
   * Matches with a new line.
   */
  newLine () {
    const res = this.char('\f\v\r\n')
    if (res !== null) {
      this.line += 1
    }
  }

  /**
   * Matches with a comment.
   *
   * @returns MatchResult indicating the presence of a comment.
   */
  comment (): MatchResult {
    this.keyword(['#'])
    while (this.pos < this.len) {
      const char = this.text[this.pos + 1]
      this.pos += 1
      if ('\f\v\r\n'.includes(char)) {
        this.line += 1
        break
      }
    }

    return { resultType: MatchResultType.COMMENT }
  }

  /**
   * Matches with white spaces taking into consideration indentation levels.
   *
   * @returns Indentation level.
   */
  wsWithIndentation (): number {
    let currentIndentationLevel = 0

    while (this.pos < this.len) {
      const blank = this.maybeKeyword([' ', '\t'])

      if (blank === null) {
        // If it is not a blank or new line, returns from the method
        break
      }

      // Tabs are not allowed
      if (blank === '\t') {
        throw new InvalidIndentationError('Tabs are not allowed to define indentation blocks')
      }

      currentIndentationLevel += 1
    }

    return currentIndentationLevel
  }

  /**
   * Matches white spaces (blanks and tabs).
   */
  ws () {
    while (this.maybeKeyword([' ', '\t']) !== null) {
      continue
    }
  }

  /**
   * Consumes all the whitespaces and new lines.
   */
  private eatWsAndNewLines () {
    while (this.maybeChar(' \f\v\r\n\t')) {
      continue
    }
  }

  /**
   * Gets final text taking in consideration imports in original text.
   *
   * @param originalText - Text to be parsed.
   * @param parentDirPath - Parent directory to keep relative paths reference.
   * @param importedFiles - Set with imported files to check if any was imported more than once.
   * @returns Final text with imported files' text on it.
   */
  private getTextWithImports (
    originalText: string,
    parentDirPath: string,
    importedFiles: Set<string>
  ): [string, Set<string>] {
    this.restartParams(originalText)
    importedFiles = this.computeImports(parentDirPath, importedFiles)
    return [this.text, importedFiles]
  }

  /**
   * Matches import sentence.
   *
   * @returns MatchResult with file name of imported file.
   */
  guraImport (): MatchResult {
    this.keyword(['import'])
    this.char(' ')
    const fileToImport = this.match([this.quotedStringWithVar])
    this.match([this.ws])
    this.maybeMatch([this.newLine])
    return { resultType: MatchResultType.IMPORT, value: fileToImport }
  }

  /**
   * Matches with a quoted string(with a single quotation mark) taking into consideration a variable inside it.
   * There is no special character escaping here.
   *
   * @returns Matched string.
   */
  quotedStringWithVar (): string {
    const quote = this.keyword(['"'])
    const chars: string[] = []

    while (true) {
      const char = this.char()

      if (char === quote) {
        break
      }

      // Computes variables values in string
      if (char === '$') {
        const varName = this.getVarName()
        chars.push(this.getVariableValue(varName))
      } else {
        chars.push(char)
      }
    }

    return chars.join('')
  }

  /**
   * Gets a variable name char by char.
   *
   * @returns Variable name.
   */
  private getVarName (): string {
    let varName = ''
    let varNameChar = this.maybeChar(KEY_ACCEPTABLE_CHARS)
    while (varNameChar !== null) {
      varName += varNameChar
      varNameChar = this.maybeChar(KEY_ACCEPTABLE_CHARS)
    }

    return varName
  }

  /**
   * Computes all the import sentences in Gura file taking into consideration relative paths to imported files.
   *
   * @param parentDirPath - Current parent directory path to join with imported files.
   * @param importedFiles - Set with already imported files to raise an error in case of importing the same file
    more than once.
   * @returns Set with imported files after all the imports to reuse in the importation process of the imported
    Gura files.
   */
  private computeImports (parentDirPath: string | null, importedFiles: Set<string>): Set<string> {
    const filesToImport: [string, string][] = []

    // First, consumes all the import sentences to replace all of them
    while (this.pos < this.len) {
      const matchResult: MatchResult = this.maybeMatch([this.guraImport, this.variable, this.uselessLine])
      if (matchResult === null) {
        break
      }

      // Checks, it could be a comment
      if (matchResult.resultType === MatchResultType.IMPORT) {
        filesToImport.push([matchResult.value, parentDirPath])
      }
    }

    let finalContent = ''
    if (filesToImport.length > 0) {
      for (let [fileToImport, originFilePath] of filesToImport) {
        // Gets the final file path considering parent directory
        if (originFilePath !== null) {
          fileToImport = path.join(originFilePath, fileToImport)
        }

        // Files can be imported only once.This prevents circular reference
        if (this.importedFiles.has(fileToImport)) {
          throw new DuplicatedImportError(`The file ${fileToImport} has been already imported`)
        }

        // Checks if file exists
        if (!existsSync(fileToImport)) {
          throw new FileNotFoundError(`The file ${fileToImport} does not exist`)
        }

        // Gets content considering imports
        const content = readFileSync(fileToImport, 'utf-8')
        const auxParser = new GuraParser()
        const parentDirPath = path.dirname(fileToImport)
        const [contentWithImport, importedFiles] = auxParser.getTextWithImports(
          content,
          parentDirPath,
          this.importedFiles
        )
        finalContent += contentWithImport + '\n'
        importedFiles.add(fileToImport)

        this.importedFiles.add(fileToImport)
      }

      // Sets as new text
      this.restartParams(finalContent + this.text.substring(this.pos + 1))
    }

    return importedFiles
  }

  /**
   * Computes imports and matches the first expression of the file.Finally consumes all the useless lines.
   *
   * @returns Dict with all the extracted values from Gura string.
   */
  start (): Object | null {
    this.computeImports(null, new Set())
    const result: MatchResult | null = this.match([this.expression])
    this.eatWsAndNewLines()
    return result !== null ? result.value[0] : null
  }

  /**
   * Matches with any primitive or complex type.
   *
   * @returns The corresponding matched value.
   */
  anyType (): any {
    const result: MatchResult | null = this.maybeMatch([this.primitiveType])
    if (result !== null) {
      return result
    }

    return this.match([this.complexType])
  }

  /**
   * Matches with a primitive value: null, bool, strings(all of the four kind of string), number or variables values.
   *
   * @returns The corresponding matched value.
   */
  primitiveType (): MatchResult {
    this.maybeMatch([this.ws])
    return this.match([this.null, this.boolean, this.basicString, this.literalString, this.number, this.variableValue])
  }

  /**
   * Matches with a list or another complex expression.
   *
   * @returns List or Dict, depending the correct matching.
   */
  complexType (): [any[], Object] | null {
    return this.match([this.list, this.expression])
  }

  /**
   * Gets a variable value for a specific key from defined variables in file or as environment variable.
   *
   * @param key - Key to retrieve.
   * @throws VariableNotDefinedError if the variable is not defined in file nor environment.
   * @returns Variable value.
   */
  private getVariableValue (key: string): any | null {
    if (this.variables.has(key)) {
      return this.variables.get(key)
    }

    const envVariable = process.env[key]
    if (envVariable !== undefined) {
      return envVariable
    }

    throw new VariableNotDefinedError(`Variable '${key}' is not defined in Gura nor as environment variable`)
  }

  /**
   * Matches with an already defined variable and gets its value.
   *
   * @returns Variable value.
   */
  variableValue (): MatchResult {
    this.keyword(['$'])
    const key = this.match([this.unquotedString])
    return { resultType: MatchResultType.PRIMITIVE, value: this.getVariableValue(key) }
  }

  /**
   * Matches with a variable definition.
   *
   * @throws DuplicatedVariableError if the current variable has been already defined.
   * @returns Match result indicating that a variable has been added.
   */
  variable (): MatchResult {
    this.keyword(['$'])
    const key = this.match([this.key])
    this.maybeMatch([this.ws])
    const matchResult: MatchResult = this.match([this.basicString, this.literalString, this.number, this.variableValue])

    if (this.variables.has(key)) {
      throw new DuplicatedVariableError(`Variable '${key}' has been already declared`)
    }

    // Store as variable
    this.variables.set(key, matchResult.value)
    return { resultType: MatchResultType.VARIABLE }
  }

  /**
   * Matches with a list.
   *
   * @returns Matched list.
   */
  list (): MatchResult {
    const result = []

    this.maybeMatch([this.ws])
    this.keyword(['['])
    while (true) {
      // Discards useless lines between elements of array
      const uselessLine = this.maybeMatch([this.uselessLine])
      if (uselessLine !== null) {
        continue
      }

      let item: MatchResult | null = this.maybeMatch([this.anyType])
      if (item === null) {
        break
      }

      if (item.resultType === MatchResultType.EXPRESSION) {
        item = item.value[0]
      } else {
        item = item.value
      }

      result.push(item)

      this.maybeMatch([this.ws])
      if (!this.maybeKeyword([','])) {
        break
      }
    }

    this.maybeMatch([this.ws])
    this.maybeMatch([this.newLine])
    this.keyword([']'])
    return { resultType: MatchResultType.LIST, value: result }
  }

  /**
   * Matches with a useless line.A line is useless when it contains only whitespaces and / or a comment finishing in a new line.
   *
   * @throws ParseError if the line contains valid data.
   * @returns MatchResult indicating the presence of a useless line.
   */
  uselessLine (): MatchResult {
    this.match([this.ws])
    const comment = this.maybeMatch([this.comment])
    const initialLine = this.line
    this.maybeMatch([this.newLine])
    const isNewLine = (this.line - initialLine) === 1

    if (comment === null && !isNewLine) {
      throw new ParseError(
        this.pos + 1,
        this.line,
        'It is a valid line'
      )
    }

    return { resultType: MatchResultType.USELESS_LINE }
  }

  /**
   * Match any Gura expression.
   *
   * @throws DuplicatedKeyError if any of the defined key was declared more than once.
   * @returns Object with Gura string data.
   */
  expression (): MatchResult {
    const result = {}
    let indentationLevel = 0
    while (this.pos < this.len) {
      const item: MatchResult | null = this.maybeMatch([this.variable, this.pair, this.uselessLine])

      if (item === null) {
        break
      }

      if (item.resultType === MatchResultType.PAIR) {
        // It is a key / value pair
        const [key, value, indentation] = item.value
        if (result[key] !== undefined) {
          throw new DuplicatedKeyError(`The key '${key}' has been already defined`)
        }

        result[key] = value
        indentationLevel = indentation
      }

      if (this.maybeKeyword([']', ',']) !== null) {
        // Breaks if it is the end of a list
        this.removeLastIndentationLevel()
        this.pos -= 1
        break
      }
    }

    return Object.keys(result).length > 0
      ? { resultType: MatchResultType.EXPRESSION, value: [result, indentationLevel] }
      : null
  }

  /**
   * Removes, if exists, the last indentation level.
   */
  private removeLastIndentationLevel () {
    if (this.indentationLevels.length > 0) {
      this.indentationLevels.pop()
    }
  }

  /**
   * Matches with a key.A key is an unquoted string followed by a colon (:).
   *
   * @throws ParseError if key is not a valid string.
   * @returns Matched key.
   */
  key (): string {
    const key = this.match([this.unquotedString])

    if (typeof key !== 'string') {
      throw new ParseError(
        this.pos + 1,
        this.line,
        `Expected string but got "${this.text.substring(this.pos + 1)}"`
      )
    }

    this.keyword([':'])
    return key
  }

  /**
   * Matches with a key - value pair taking into consideration the indentation levels.
   *
   * @returns Matched key - value pair.null if the indentation level is lower than the last one(to indicate the ending of a parent object).
   */
  pair (): MatchResult | null {
    const posBeforePair = this.pos
    const currentIndentationLevel = this.maybeMatch([this.wsWithIndentation])

    const key = this.match([this.key])
    this.maybeMatch([this.ws])
    this.maybeMatch([this.newLine])

    // Check indentation
    const lastIndentationBlock = this.getLastIndentationLevel()

    // Check if indentation is divisible by 4
    if (currentIndentationLevel % 4 !== 0) {
      throw new InvalidIndentationError(`Indentation block (${currentIndentationLevel}) must be divisible by 4`)
    }

    if (lastIndentationBlock === null || currentIndentationLevel > lastIndentationBlock) {
      this.indentationLevels.push(currentIndentationLevel)
    } else {
      if (currentIndentationLevel < lastIndentationBlock) {
        this.removeLastIndentationLevel()

        // As the indentation was consumed, it is needed to return to line beginning to get the indentation level
        // again in the previous matching.Otherwise, the other match would get indentation level = 0
        this.pos = posBeforePair
        return null // This breaks the parent loop
      }
    }

    // If it === null then is an empty expression, and therefore invalid
    let result: MatchResult | null = this.match([this.anyType])
    if (result === null) {
      throw new ParseError(
        this.pos + 1,
        this.line,
        'Invalid pair'
      )
    }

    // Checks indentation against parent level
    if (result.resultType === MatchResultType.EXPRESSION) {
      const [objectValues, indentationLevel] = result.value
      if (indentationLevel === currentIndentationLevel) {
        throw new InvalidIndentationError(`Wrong level for parent with key ${key}`)
      } else {
        if (Math.abs(currentIndentationLevel - indentationLevel) !== 4) {
          throw new InvalidIndentationError('Difference between different indentation levels must be 4')
        }
      }

      result = objectValues
    } else {
      result = result.value
    }

    this.maybeMatch([this.newLine])

    return { resultType: MatchResultType.PAIR, value: [key, result, currentIndentationLevel] }
  }

  /**
   * Gets the last indentation level or null in case it does not exist.
   *
   * @returns Last indentation level or null if it does not exist.
   */
  private getLastIndentationLevel (): number | null {
    return this.indentationLevels.length === 0 ? null : this.indentationLevels[this.indentationLevels.length - 1]
  }

  /**
   * Consumes null keyword and return null.
   *
   * @returns Null.
   */
  null (): MatchResult {
    this.keyword(['null'])
    return { resultType: MatchResultType.PRIMITIVE, value: null }
  }

  /**
   * Parses boolean values.
   *
   * @returns Matched boolean value.
   */
  boolean (): MatchResult {
    const value = this.keyword(['true', 'false']) === 'true'
    return { resultType: MatchResultType.PRIMITIVE, value: value }
  }

  /**
   * Parses an unquoted string.Useful for keys.
   *
   * @returns Parsed unquoted string.
   */
  unquotedString (): string {
    const chars = [this.char(KEY_ACCEPTABLE_CHARS)]

    while (true) {
      const char = this.maybeChar(KEY_ACCEPTABLE_CHARS)
      if (char === null) {
        break
      }

      chars.push(char)
    }

    return chars.join('').trimRight()
  }

  /**
   * Parses a string checking if it is a number and get its correct value.
   *
   * @throws ParseError if the extracted string is not a valid number.
   * @returns Returns an number or a float depending of type inference.
   */
  number (): MatchResult {
    let numberType: 'integer' | 'float' = 'integer'

    const chars = [this.char(ACCEPTABLE_NUMBER_CHARS)]

    while (true) {
      const char = this.maybeChar(ACCEPTABLE_NUMBER_CHARS)
      if (char === null) {
        break
      }

      if ('Ee.'.includes(char)) {
        numberType = 'float'
      }

      chars.push(char)
    }

    // Replaces underscores as JS does not support them
    const result = chars.join('').trimRight().replace(/_/g, '')

    // Checks hexadecimal and octal format
    const prefix = result.substring(0, 2)
    if (['0x', '0o', '0b'].includes(prefix)) {
      let base: number
      const withoutPrefix = result.substring(2)
      switch (prefix) {
        case '0x':
          base = 16
          break
        case '0o':
          base = 8
          break
        default:
          base = 2
          break
      }

      return { resultType: MatchResultType.PRIMITIVE, value: parseInt(withoutPrefix, base) }
    }

    // Checks inf or NaN
    const lastThreeChars = result.substring(result.length - 3)
    if (lastThreeChars === 'inf') {
      return { resultType: MatchResultType.PRIMITIVE, value: result[0] === '-' ? -Infinity : Infinity }
    } else {
      if (lastThreeChars === 'nan') {
        return { resultType: MatchResultType.PRIMITIVE, value: NaN }
      }
    }

    // NOTE: JS does not raise a parsing error when an invalid value is casted to number. That's why it's checked here
    const resultValue = numberType === 'integer' ? parseInt(result) : parseFloat(result)
    if (isNaN(resultValue)) {
      throw new ParseError(
        this.pos + 1,
        this.line,
        `'${result}' is not a valid number`
      )
    }

    return { resultType: MatchResultType.PRIMITIVE, value: resultValue }
  }

  /**
   * Matches with a simple / multiline basic string.
   *
   * @returns Matched string.
   */
  basicString (): MatchResult {
    const quote = this.keyword(['"""', '"'])

    const isMultiline = quote === '"""'

    // NOTE: A newline immediately following the opening delimiter will be trimmed.All other whitespace and
    // newline characters remain intact.
    if (isMultiline) {
      this.maybeChar('\n')
    }

    const chars = []

    while (true) {
      const closingQuote = this.maybeKeyword([quote])
      if (closingQuote !== null) {
        break
      }

      const char = this.char()
      if (char === '\\') {
        const escape = this.char()

        // Checks backslash followed by a newline to trim all whitespaces
        if (isMultiline && escape === '\n') {
          this.eatWsAndNewLines()
        } else {
          // Supports Unicode of 16 and 32 bits representation
          if (escape === 'u' || escape === 'U') {
            const numCharsCodePoint = escape === 'u' ? 4 : 8
            const codePoint = []
            for (let i = 0; i < numCharsCodePoint; i++) {
              codePoint.push(this.char('0-9a-fA-F'))
            }
            const hexValue = parseInt(codePoint.join(''), 16)
            const charValue = String.fromCharCode(hexValue) // Converts from UNICODE to string
            chars.push(charValue)
          } else {
            // Gets escaped char
            chars.push(ESCAPE_SEQUENCES[escape] ?? char)
          }
        }
      } else {
        // Computes variables values in string
        if (char === '$') {
          const varName = this.getVarName()
          chars.push(this.getVariableValue(varName))
        } else {
          chars.push(char)
        }
      }
    }

    return { resultType: MatchResultType.PRIMITIVE, value: chars.join('') }
  }

  /**
   * Matches with a simple / multiline literal string.
   *
   * @returns Matched string.
   */
  literalString (): MatchResult {
    const quote = this.keyword(["'''", "'"])

    const isMultiline = quote === "'''"

    // NOTE: A newline immediately following the opening delimiter will be trimmed.All other whitespace and
    // newline characters remain intact.
    if (isMultiline) {
      this.maybeChar('\n')
    }

    const chars = []

    while (true) {
      const closingQuote = this.maybeKeyword([quote])
      if (closingQuote !== null) {
        break
      }

      const char = this.char()
      chars.push(char)
    }

    return { resultType: MatchResultType.PRIMITIVE, value: chars.join('') }
  }

  /**
   * Takes a value, check its type and returns its correct value.
   *
   * @param indentationLevel - Current indentation level to compute indentation in string.
   * @param value - Value retrieved from dict to transform in string.
   * @returns String representation of the received value.
   */
  private getValueForString (indentationLevel: number, value: any): string {
    if (value === null) {
      return 'null'
    }

    const valueType = typeof value
    switch (valueType) {
      case 'string':
        return `"${value}"`
      case 'number':
        // Special cases
        if (value === Number.POSITIVE_INFINITY) {
          return 'inf'
        } else {
          if (value === Number.NEGATIVE_INFINITY) {
            return '-inf'
          } else {
            if (isNaN(value)) {
              return 'nan'
            }
          }
        }

        // Normal number
        return value.toString()
      case 'boolean':
        return value ? 'true' : 'false'
      case 'object':
        // Checks if it is an array as typeof [] === 'object'
        if (Array.isArray(value)) {
          const list = value as any[]
          const listValues = list.map((listElem) => this.getValueForString(indentationLevel, listElem))
          return '[' + listValues.join(', ') + ']'
        }

        return '\n' + this.dump(value, indentationLevel + 1)
    }

    return ''
  }

  /**
   * Generates a Gura string from a dictionary(aka.stringify).
   *
   * @param data - Object data to stringify.
   * @param indentationLevel - Current indentation level.
   * @returns String with the data in Gura format.
   */
  dump (data: Object, indentationLevel: number = 0): string {
    let result = ''
    Object.entries(data).forEach(([key, value]) => {
      const indentation = ' '.repeat(indentationLevel * 4)
      result += `${indentation}${key}: `
      result += this.getValueForString(indentationLevel, value)
      result += '\n'
    })

    return result
  }
}

/* ++++++++++++++++++++ PARSER ++++++++++++++++++++ */

/**
 * Parses a text in Gura format.
 *
 * @param text - Text to be parsed.
 * @throws ParseError if the syntax of text is invalid.
 * @returns Dict with all the parsed values.
 */
const parse = (text: string): Object => {
  return new GuraParser().parse(text)
}

/**
 * Generates a Gura string from a dictionary(aka.stringify).
 *
 * @param data - Object to stringify.
 * @returns String with the data in Gura format.
 */
const dump = (data: Object): string => {
  return new GuraParser().dump(data)
}

export {
  parse,
  dump,
  VariableNotDefinedError,
  DuplicatedVariableError,
  InvalidIndentationError,
  FileNotFoundError,
  DuplicatedKeyError,
  DuplicatedImportError
}
