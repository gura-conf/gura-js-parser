import { Parser, ParseError } from './parser'

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


/* ++++++++++++++++++++ PARSER ++++++++++++++++++++ */


// Number chars
const BASIC_NUMBERS_CHARS = '0-9'
const HEX_OCT_BIN = 'A-Fa-fxob'
const INF_AND_NAN = 'in'  // The rest of the chars are defined in hex_oct_bin
// IMPORTANT: '-' char must be last, otherwise it will be interpreted as a range
const ACCEPTABLE_NUMBER_CHARS = BASIC_NUMBERS_CHARS + HEX_OCT_BIN + INF_AND_NAN + 'Ee+._-'

// Acceptable chars for keys
const KEY_ACCEPTABLE_CHARS = '0-9A-Za-z_-'

// Special characters to be escaped
const ESCAPE_SEQUENCES = {
  'b': '\b',
  'f': '\f',
  'n': '\n',
  'r': '\r',
  't': '\t',
  '"': '"',
  '\\': '\\',
  '$': '$'
}

/* Data types to be returned by match expression methods */
enum MatchResultType {
  USELESS_LINE,
  PAIR,
  COMMENT,
  IMPORT,
  VARIABLE,
  EXPRESSION,
}

/* Match expression method's result */
interface MatchResult {
  result_type: MatchResultType
  value?: any
}

type PrimitiveType = null | boolean | number | string

class GuraParser extends Parser {
  private variables: Map<string, any>
  private indent_char: string | null
  private indentation_levels: number[]
  private imported_files: Set<string>

  constructor () {
    super()

    this.variables = new Map()
    this.indent_char = null
    this.indentation_levels = []
    this.imported_files = new Set()
  }

  /**
   * Parses a text in Gura format.
   *
   * @param text - Text to be parsed.
   * @throws ParseError if the syntax of text is invalid.
   * @returns Object with all the parsed values.
   */
  loads (text: string): Object {
    this.restart_params(text)
    result = this.start()
    this.assert_end()
    return result !== null ? result : {}
  }

  /**
   * Sets the params to start parsing from a specific text.
   *
   * @param text - Text to set as the internal text to be parsed
   */
  private restart_params(text: string) {
    this.text = text
    this.pos = -1
    this.line = 0
    this.len = len(text) - 1
  }

  /**
   * Matches with a new line.
   */
  new_line() {
    res = this.char('\f\v\r\n')
    if (res !== null) {
      this.line += 1
    }
  }

  /**
   * Matches with a comment.
   * 
   * @returns MatchResult indicating the presence of a comment
   */
  comment(): MatchResult {
    this.keyword('#')
    while (this.pos < this.len) {
      char = this.text[this.pos + 1]
      this.pos += 1
      if ('\f\v\r\n'.includes(char)) {
        this.line += 1
        break
      }
    }

    return { type: MatchResultType.COMMENT }
  }
  
  /**
   * Matches with white spaces taking into consideration indentation levels.
   *
   * @returns Indentation level
   */
  ws_with_indentation(): number {
    let current_indentation_level = 0
    
    while (this.pos < this.len) {
      blank = this.maybe_keyword(' ', '\t')
      
      if (blank === null) {
        // If it is not a blank or new line, returns from the method
        break
      }

      // If it is the first case of indentation stores the indentation char
      if (this.indent_char !== null) {
        // If user uses different kind of indentation raises a parsing error
        if (blank != this.indent_char) {
          this.raise_indentation_char_error()
        }
      } else {
        // From now on this character will be used to indicate the indentation
        this.indent_char = blank
      }
      current_indentation_level += 1
    }
    
    
    return current_indentation_level
  }

  /**
   * Matches white spaces (blanks and tabs).
   */
  ws() {
    while (this.maybe_keyword(' ', '\t') !== null) {
      continue
    }
  }
  
  /**
   * Consumes all the whitespaces and new lines.
   */
  eat_ws_and_new_lines() {
    while (this.maybe_char(' \f\v\r\n\t')) {
      continue
    }
  }

  /**
   * Raises a ParseError indicating that the indentation chars are inconsistent.
   *
   * @throws ParseError as described in method description.
   */
  private raise_indentation_char_error() {
    if (this.indent_char === '\t') {
      const good_char = 'tabs'
      const received_char = 'whitespace'
    } else {
      good_char = 'whitespace'
      received_char = 'tabs'
    }

    throw new InvalidIndentationError(`Wrong indentation character! Using ${good_char} but received ${received_char}`)
  }

  /**
   * Gets final text taking in consideration imports in original text.
   *
   * @param original_text - Text to be parsed.
   * @param parent_dir_path - Parent directory to keep relative paths reference.
   * @param imported_files - Set with imported files to check if any was imported more than once.
   * @returns Final text with imported files' text on it
   */
  get_text_with_imports(
    original_text: string,
    parent_dir_path: string,
    imported_files: Set[string]
  ): [string, Set<string>] {
    this.restart_params(original_text)
    imported_files = this.__compute_imports(parent_dir_path, imported_files)
    return this.text, imported_files
  }

  /**
   * Matches import sentence.
   * @returns MatchResult with file name of imported file
   */
  gura_import(): MatchResult {
    this.keyword('import')
    this.match('ws')
    const file_to_import = this.match('quoted_string_with_var')
    this.match('ws')
    this.maybe_match('new_line')
    return { type: MatchResultType.IMPORT, value: file_to_import }
  }
  
  /**
   * Matches with a quoted string(with a single quotation mark) taking into consideration a variable inside it.
   * There is no special character escaping here.
   *
   * @returns Matched string
   */
  quoted_string_with_var(): string {
    const quote = this.keyword('"')
    const chars: string[] = []
    
    while (true) {
      char = this.char()
    
      if (char === quote) {
        break
      }
    
      // Computes variables values in string
      if (char === '$') {
        var_name = this.__get_var_name()
        chars.append(this.__get_variable_value(var_name))
      } else {
        chars.append(char)
      }
    }
    
    return chars.join('')
  }

  /**
   * Gets a variable name char by char.
   *
   * @returns Variable name
   */
  private __get_var_name(): string {
    const var_name = ''
    const var_name_char = this.maybe_char(KEY_ACCEPTABLE_CHARS)
    while (var_name_char !== null) {
      var_name += var_name_char
      var_name_char = this.maybe_char(KEY_ACCEPTABLE_CHARS)
    }

    return var_name
  }

  /**
   * Computes all the import sentences in Gura file taking into consideration relative paths to imported files.
   *
   * @param parent_dir_path - Current parent directory path to join with imported files.
   * @param imported_files - Set with already imported files to raise an error in case of importing the same file
    more than once.
   * @returns Set with imported files after all the imports to reuse in the importation process of the imported
    Gura files.
   */
  private __compute_imports(parent_dir_path: string | null, imported_files: Set<string>): Set<string> {
    const files_to_import: List[Tuple[string, string]] = []
    
    // First, consumes all the import sentences to replace all of them
    while (this.pos < this.len) {
      const match_result: MatchResult = this.maybe_match('gura_import', 'variable', 'useless_line')
      if (match_result === null) {
        break
      }
      
      // Checks, it could be a comment
      if (match_result.result_type == MatchResultType.IMPORT) {
        files_to_import.append((match_result.value, parent_dir_path))
      }
    }
    
    if (files_to_import.length > 0) {
        let final_content = ''
        files_to_import.forEach(([file_to_import, origin_file_path]) => {

          // Gets the final file path considering parent directory
          if (origin_file_path !== null) {
            file_to_import = os.path.join(origin_file_path, file_to_import)
          }

          // Files can be imported only once.This prevents circular reference
          if (imported_files.includes(file_to_import)) {
            throw new DuplicatedImportError(`The file ${file_to_import} has been already imported`)
          }

          // FIXME: when it's finished the rest of the files
          // with open(file_to_import, 'r') as f {
          //   // Gets content considering imports
          //   content = f.read()
          //   aux_parser = GuraParser()
          //   parent_dir_path = os.path.dirname(file_to_import)
          //   content_with_import, imported_files = aux_parser.get_text_with_imports(
          //   content,
          //   parent_dir_path,
          //   imported_files
          //   )
          //   final_content += content_with_import + '\n'
          //   imported_files.add(file_to_import)

          //   this.imported_files.add(file_to_import)
          // }
        })
      
      // Sets as new text
      this.restart_params(final_content + this.text.substring(this.pos + 1))
    }

    return imported_files
  }

  /**
   * Computes imports and matches the first expression of the file.Finally consumes all the useless lines.
   *
   * @returns Dict with all the extracted values from Gura string.
   */
  start(): Object | null {
    this.__compute_imports(parent_dir_path = null, imported_files = set())
    const result: MatchResult | null = this.match('expression')
    this.eat_ws_and_new_lines()
    return result !== null ? result.value[0] : null
  }

  /**
   * Matches with any primitive or complex type.
   *
   * @returns The corresponding matched value
   */
  any_type(): any {
    const result = this.maybe_match('primitive_type')
    if (result !== null) {
      return result
    }
    
    return this.match('complex_type')
  }

  /**
   * Matches with a primitive value: null, bool, strings(all of the four kind of string), number or variables values.
   *
   * @returns The corresponding matched value.
   */
  primitive_type(): PrimitiveType  {
    this.maybe_match('ws')
    return this.match('null', 'boolean', 'basic_string', 'literal_string', 'number', 'variable_value')
  }

  /**
   * Matches with a list or another complex expression.
   *
   * @returns List or Dict, depending the correct matching.
   */
  complex_type(): [any[], Object] | null {
    return this.match('list', 'expression')
  }

  /**
   * Gets a variable value for a specific key from defined variables in file or as environment variable.
   *
   * @param key - Key to retrieve.
   * @throws VariableNotDefinedError if the variable is not defined in file nor environment.
   * @returns Variable value.
   */
  private __get_variable_value(key: string): any | null {
    if (this.variables.includes(key))
      return this.variables[key]
    
    env_variable = os.getenv(key)
    if (env_variable !== null) {
      return env_variable
    }
  
    throw new VariableNotDefinedError(`Variable '${key}' is not defined in Gura nor as environment variable`)
  }

  /**
   * Matches with an already defined variable and gets its value.
   * 
   * @returns Variable value.
   */
  variable_value(): any {
    this.keyword('$')
    const key = this.match('unquoted_string')
    return this.__get_variable_value(key)
  }

  /**
   * Matches with a variable definition.
   *
   * @throws DuplicatedVariableError if the current variable has been already defined.
   * @returns Match result indicating that a variable has been added.
   */
  variable(): MatchResult {
    this.keyword('$')
    const key = this.match('key')
    this.maybe_match('ws')
    const value = this.match('any_type')
    
    if (this.variables.includes(key)) {
      throw new DuplicatedVariableError(`Variable '${key}' has been already declared`)
    }
    
    // Store as variable
    this.variables[key] = value
    return { result_type: MatchResultType.VARIABLE }
  }

  /**
   * Matches with a list.
   *
   * @returns Matched list.
   */
  list(): any[] {
    const result = []
    
    this.maybe_match('ws')
    this.keyword('[')
    while (true) {
      this.maybe_match('ws')
      this.maybe_match('new_line')
      
      // Discards useless lines between elements of array
      const useless_line = this.maybe_match('useless_line')
      if (useless_line !== null) {
        continue
      }
      
      const item = this.maybe_match('any_type')
      if (item === null) {
        break
      }
      
      if (typeof item === MatchResult && item.result_type == MatchResultType.EXPRESSION) {
        item = item.value[0]
      }

      result.append(item)
      
      this.maybe_match('ws')
      if (!this.maybe_keyword(',')) {
        break
      }
    }
    
    this.maybe_match('ws')
    this.maybe_match('new_line')
    this.keyword(']')
    return result
  }

  /**
   * Matches with a useless line.A line is useless when it contains only whitespaces and / or a comment finishing in a new line.
   *
   * @throws ParseError if the line contains valid data.
   * @returns MatchResult indicating the presence of a useless line.
   */
  useless_line(): MatchResult {
    this.match('ws')
    const comment = this.maybe_match('comment')
    const initial_line = this.line
    this.maybe_match('new_line')
    const is_new_line = (this.line - initial_line) == 1
    
    if (comment === null && !is_new_line) {
      throw new ParseError(
        this.pos + 1,
        this.line,
        'It is a valid line'
      )
    }
    
    return MatchResult(MatchResultType.USELESS_LINE)
  }
  
  /**
   * Match any Gura expression.
   *
   * @throws DuplicatedKeyError if any of the defined key was declared more than once.
   * @returns Object with Gura string data.
   */
  expression(): MatchResult {
    const result = {}
    const indentation_level = 0
    while (this.pos < this.len) {
      const item: MatchResult | null = this.maybe_match('variable', 'pair', 'useless_line')
    
      if (item === null) {
        break
      }

      if (item.result_type == MatchResultType.PAIR) {
        // It is a key / value pair
        const [key, value, indentation] = item.value
        if (result[key] !== undefined) {
          throw new DuplicatedKeyError(`The key '${key}' has been already defined`)
        }

        result[key] = value
        indentation_level = indentation
      }
      
      if (this.maybe_keyword(']', ',') !== null) {
        // Breaks if it is the end of a list
        this.__remove_last_indentation_level()
        this.pos -= 1
        break
      }
    }
    
    return Object.keys(result).length > 0
      ? { result_type: MatchResultType.EXPRESSION, value: (result, indentation_level) }
      : null
  }

  /**
   * Removes, if exists, the last indentation level.
   */
  private __remove_last_indentation_level() {
    if (this.indentation_levels.length > 0) {
      this.indentation_levels.pop()
    }
  }
  
  /**
   * Matches with a key.A key is an unquoted string followed by a colon (:).
   *
   * @throws ParseError if key is not a valid string.
   * @returns Matched key.
   */
  key(): string {
    const key = this.match('unquoted_string')
    
    if (typeof key !== 'string') {
      throw new ParseError(
        this.pos + 1,
        this.line,
        `Expected string but got "${this.text.substring(this.pos + 1)}"`, 
      )
    }
    
    this.keyword(':')
    return key
  }
  
  /**
   * Matches with a key - value pair taking into consideration the indentation levels.
   *
   * @returns Matched key - value pair.null if the indentation level is lower than the last one(to indicate the ending of a parent object)
   */
  pair(): MatchResult | null {
    const pos_before_pair = this.pos
    const current_indentation_level = this.maybe_match('ws_with_indentation')
    
    const key = this.match('key')
    this.maybe_match('ws')
    this.maybe_match('new_line')
    
    // Check indentation
    const last_indentation_block = this.__get_last_indentation_level()
    
    // Check if indentation is divisible by 2
    if (current_indentation_level % 2 != 0) {
      throw new InvalidIndentationError('Indentation block must be divisible by 2')
    }
    
    if (last_indentation_block === null || current_indentation_level > last_indentation_block) {
      this.indentation_levels.push(current_indentation_level)
    } else {
      if (current_indentation_level < last_indentation_block) {
        this.__remove_last_indentation_level()

        // As the indentation was consumed, it is needed to return to line beginning to get the indentation level
        // again in the previous matching.Otherwise, the other match would get indentation level = 0
        this.pos = pos_before_pair
        return null  // This breaks the parent loop
      }
    }
    
    
    // If it === null then is an empty expression, and therefore invalid
    let value = this.match('any_type')
    if (value === null) {
      throw new ParseError(
        this.pos + 1,
        this.line,
        'Invalid pair'
      )
    }
    
    if (value?.result_type == MatchResultType.EXPRESSION) {
      const dict_values, indentation_level = value.value
      if (indentation_level == current_indentation_level) {
        throw new InvalidIndentationError(`Wrong level for parent with key ${key}`)
      }
      
      value = dict_values
    }
    
    
    this.maybe_match('new_line')
    
    return { result_type: MatchResultType.PAIR, value: [key, value, current_indentation_level] }
  }
  
  /**
   * Gets the last indentation level or null in case it does not exist.
   *
   * @returns Last indentation level or null if it does not exist
   */
  __get_last_indentation_level(): number | null {
    return this.indentation_levels.length == 0 ? null : this.indentation_levels[this.indentation_levels.length - 1]
  }

  /**
   * Consumes null keyword and return null.
   *
   * @returns Null
   */
  null(): null {
    this.keyword('null')
    return null
  }

  /**
   * Parses boolean values.
   *
   * @returns Matched boolean value.
   */
  boolean(): boolean {
    return this.keyword(['true', 'false']) === 'true'
  }

  /**
   * Parses an unquoted string.Useful for keys.
   *
   * @returns Parsed unquoted string.
   */
  unquoted_string(): string {
    const chars = [this.char(KEY_ACCEPTABLE_CHARS)]
    
    while (true) {
      const char = this.maybe_char(KEY_ACCEPTABLE_CHARS)
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
  number(): number {
    let number_type: 'integer' | 'float' = 'integer'
    
    const chars = [this.char(ACCEPTABLE_NUMBER_CHARS)]
    
    while (true) {
      const char = this.maybe_char(ACCEPTABLE_NUMBER_CHARS)
      if (char === null) {
        break
      }

      if (['Ee.'].includes(char)) {
        number_type = 'float'
      }
      
      chars.push(char)
      
    }
    
    const result = chars.join('').trimRight()
    
    // Checks hexadecimal and octal format
    const prefix = result.substring(0, 2)
    if (['0x', '0o', '0b'].includes(prefix)) {
      let base: number
      const without_prefix = result.substring(2)
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
      
      return parseInt(without_prefix, base)
    }
    
    // Checks inf or NaN
    const last_three_chars = result.substring(result.length - 3)
    if (last_three_chars === 'inf') {
      return Infinity
    } else {
      if (last_three_chars === 'nan') {
        return NaN
      }
    }
    
    try {
      if (number_type === 'integer') {
        return parseInt(result)
      } else {
        return parseFloat(result)
      }
    } catch {
      throw new ParseError(
        this.pos + 1,
        this.line,
        `'${result}' is not a valid number`
      )
    }
  }

  /**
   * Matches with a simple / multiline basic string.
   *
   * @returns Matched string.
   */
  basic_string(): string {
    const quote = this.keyword('"""', '"')
    
    const is_multiline = quote == '"""'
    
    // NOTE: A newline immediately following the opening delimiter will be trimmed.All other whitespace and
    // newline characters remain intact.
    if (is_multiline) {
      this.maybe_char('\n')
    }
    
    const chars = []

    while (true) {
      const closing_quote = this.maybe_keyword(quote)
      if (closing_quote !== null) {
        break
      }
      
      const char = this.char()
      if (char == '\\') {
        const escape = this.char()
      
        // Checks backslash followed by a newline to trim all whitespaces
        if (is_multiline && escape === '\n') {
          this.eat_ws_and_new_lines()
        } else {
          // Supports Unicode of 16 and 32 bits representation
          if (escape === 'u' || escape === 'U') {
            const num_chars_code_point = escape == 'u' ? 4 : 8
            const code_point = []
            for (let i =0; i < num_chars_code_point; i++) {
              code_point.push(this.char('0-9a-fA-F'))
            }
            const hex_value = parseInt(code_point.join(''), 16)
            const charValue = Buffer.alloc(hex_value).toString() // Converts from UNICODE to string
            chars.push(charValue)
          } else {
            // Gets escaped char
            chars.push(ESCAPE_SEQUENCES[escape] ?? char)
          }
        }
      } else {
        // Computes variables values in string
        if (char == '$') {
          const var_name = this.__get_var_name()
          chars.push(this.__get_variable_value(var_name))
        } else {
          chars.push(char)
        }
      }
    }
    
    return chars.join('')
  }
}


def literal_string(): string:
"""
Matches with a simple / multiline literal string
: return: Matched string
"""
quote = this.keyword("'''", "'")

is_multiline = quote == "'''"

        // NOTE: A newline immediately following the opening delimiter will be trimmed.All other whitespace and
        // newline characters remain intact.
if is_multiline:
  this.maybe_char('\n')

chars = []

while True:
  closing_quote = this.maybe_keyword(quote)
if closing_quote !== null:
break

char = this.char()
chars.append(char)

return ''.join(chars)

def __get_value_for_string(indentation_level, value): string:
"""
Takes a value, check its type and returns its correct value
: param indentation_level: Current indentation level to compute indentation in string
        : param value: Value retrieved from dict to transform in string
        : return: String representation of the received value
"""
value_type = type(value)
if value_type == string:
  return f'"{value}"'
if value_type in (number, float):
  return string(value)
if value_type == bool:
  return 'true' if value is True else 'false'
if value_type == dict:
  return '\n' + this.dumps(value, indentation_level + 1)
if value_type == list:
  list_values = [
    this.__get_value_for_string(indentation_level, list_elem)
                for list_elem in value
            ]
return '[' + ', '.join(list_values) + ']'
return ''

def dumps(data: Dict, indentation_level: number = 0): string:
"""
Generates a Gura string from a dictionary(aka.stringify)
        : param data: Dictionary data to stringify
: param indentation_level: Current indentation level
: return: String with the data in Gura format
"""
result = ''
for key, value in data.items():
  indentation = ' ' * (indentation_level * 4)
result += f'{indentation}{key}: '
result += this.__get_value_for_string(indentation_level, value)
result += '\n'
return result


/* ++++++++++++++++++++ PARSER ++++++++++++++++++++ */



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
