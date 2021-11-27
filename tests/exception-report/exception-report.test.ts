import { GuraError } from '../../src/errors'
import { DuplicatedImportError, DuplicatedKeyError, DuplicatedVariableError, InvalidIndentationError, ParseError, VariableNotDefinedError } from '../../src/index'
import { getFileContentParsed } from '../utils'

const parentFolder = 'exception-report'

/**
 * Test error position and line of a specific file.
 *
 * @param filename - File path to check.
 * @param expectedError - Expected exception type.
 * @param pos - Error position.
 * @param line - Error line.
 */
function testFail (filename: string, expectedError: { new(...args: any[]): GuraError }, pos: number, line: number) {
  try {
    getFileContentParsed(parentFolder, filename)
    throw new Error(`Must raise ${expectedError}`)
  } catch (ex) {
    expect(ex).toBeInstanceOf(expectedError)
    expect(ex.pos).toEqual(pos)
    expect(ex.line).toEqual(line)
  }
}

/** Tests error position and line at beginning. */
test('test_line_and_pos_1', () => {
  testFail('parsing_error_1.ura', ParseError, 0, 1)
})

/** Tests error position and line at the end of file. */
test('test_line_and_pos_2', () => {
  testFail('parsing_error_2.ura', ParseError, 10, 1)
})

/** Tests error position and line in some random line. */
test('test_line_and_pos_3', () => {
  testFail('parsing_error_3.ura', ParseError, 42, 2)
})

/** Tests error position and line in some random line. */
test('test_line_and_pos_4', () => {
  testFail('parsing_error_4.ura', ParseError, 45, 6)
})

/** Tests error position and line when user uses tabs to indent. */
test('test_line_and_pos_indentation_1', () => {
  testFail('indentation_error_1.ura', InvalidIndentationError, 20, 3)
})

/** Tests error position and line when indentation is not divisible by 4. */
test('test_line_and_pos_indentation_2', () => {
  testFail('indentation_error_2.ura', InvalidIndentationError, 19, 3)
})

/** Tests error position and line when pair indentation is the same as the the parent. */
test('test_line_and_pos_indentation_3', () => {
  testFail('indentation_error_3.ura', InvalidIndentationError, 18, 3)
})

/** Tests error position and line when pair indentation is more than 4 spaces from parent indentation level. */
test('test_line_and_pos_indentation_4', () => {
  testFail('indentation_error_4.ura', InvalidIndentationError, 26, 3)
})

/** Tests error position and line when user defines the same key twice. */
test('test_duplicated_key_1', () => {
  testFail('duplicated_key_error_1.ura', DuplicatedKeyError, 11, 2)
})

/** Tests error position and line when user defines the same key twice but in other line than 0. */
test('test_duplicated_key_2', () => {
  testFail('duplicated_key_error_2.ura', DuplicatedKeyError, 21, 3)
})

/** Tests error position and line when user defines the same key twice inside an object. */
test('test_duplicated_key_3', () => {
  testFail('duplicated_key_error_3.ura', DuplicatedKeyError, 37, 4)
})

/** Tests error position and line when user defines the same variable twice inside an object. */
test('test_duplicated_variable_1', () => {
  testFail('duplicated_variable_error_1.ura', DuplicatedVariableError, 12, 2)
})

/** Tests error position and line when user defines the same variable twice but in other line than 0. */
test('test_duplicated_variable_2', () => {
  testFail('duplicated_variable_error_2.ura', DuplicatedVariableError, 25, 3)
})

/** Tests error position and line when user defines the same variable twice but in other line than 0. */
test('test_duplicated_variable_3', () => {
  testFail('duplicated_variable_error_3.ura', DuplicatedVariableError, 37, 6)
})

/** Tests error position and line when user uses a non defined variable. */
test('test_missing_variable_1', () => {
  testFail('missing_variable_error_1.ura', VariableNotDefinedError, 5, 1)
})

/** Tests error position and line when user uses a non defined variable but in other line than 0. */
test('test_missing_variable_2', () => {
  testFail('missing_variable_error_2.ura', VariableNotDefinedError, 19, 2)
})

/** Tests error position and line when user uses a non defined variable but in other line than 0. */
test('test_missing_variable_3', () => {
  testFail('missing_variable_error_3.ura', VariableNotDefinedError, 33, 7)
})

/** Tests error position and line when user uses a non defined variable inside a basic string. */
test('test_missing_variable_4', () => {
  testFail('missing_variable_error_4.ura', VariableNotDefinedError, 17, 1)
})

/** Tests error position and line when user uses a non defined variable inside a multiline basic string. */
test('test_missing_variable_5', () => {
  testFail('missing_variable_error_5.ura', VariableNotDefinedError, 24, 2)
})

/** Tests error position and line when user uses a non defined variable inside an import statement. */
test('test_missing_variable_6', () => {
  testFail('missing_variable_error_6.ura', VariableNotDefinedError, 21, 1)
})

/** Tests error position and line when imported files are duplicated. */
test('test_duplicated_import_1', () => {
  testFail('importing_error_1.ura', DuplicatedImportError, 74, 2)
})

/** Tests error position and line when imported files are duplicated but in other line than 0. */
test('test_duplicated_import_2', () => {
  testFail('importing_error_2.ura', DuplicatedImportError, 86, 5)
})
