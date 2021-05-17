import { getFileContentParsed } from '../utils'
import { parse, VariableNotDefinedError } from '../../src/index'

const parentFolder = 'strings'

// Basic
const escapedValue = '$name is cool'
const expectedBasic = {
  str: "I'm a string. \"You can quote me\". Na\bme\tJos\u00E9\nLocation\tSF.",
  str_2: "I'm a string. \"You can quote me\". Na\bme\tJosé\nLocation\tSF.",
  with_var: 'Gura is cool',
  escaped_var: escapedValue,
  with_env_var: 'Gura is very cool'
}

// Multiline basic
const multilineValue = 'Roses are red\nViolets are blue'
const multilineValueWithoutNewline = 'The quick brown fox jumps over the lazy dog.'
const expectedMultilineBasic = {
  str: multilineValue,
  str_2: multilineValue,
  str_3: multilineValue,
  with_var: multilineValue,
  with_env_var: multilineValue,
  str_with_backslash: multilineValueWithoutNewline,
  str_with_backslash_2: multilineValueWithoutNewline,
  str_4: 'Here are two quotation marks: "". Simple enough.',
  str_5: 'Here are three quotation marks: """.',
  str_6: 'Here are fifteen quotation marks: """"""""""""""".',
  escaped_var: escapedValue
}

// Literal
const expectedLiteral = {
  quoted: 'John "Dog lover" Wick',
  regex: '<\\i\\c*\\s*>',
  winpath: 'C:\\Users\\nodejs\\templates',
  winpath2: '\\\\ServerX\\admin$\\system32\\',
  with_var: '$no_parsed variable!',
  escaped_var: escapedValue
}

// Multiline literal
const expectedMultilineLiteral = {
  lines: 'The first newline is\ntrimmed in raw strings.\n   All other whitespace\n   is preserved.\n',
  regex2: "I [dw]on't need \\d{2} apples",
  with_var: '$no_parsed variable!',
  escaped_var: escapedValue
}

/** Tests basic strings. */
test('string_basic', () => {
  const envVarName = 'env_var_value'
  process.env[envVarName] = 'very'
  const parsedData = getFileContentParsed(parentFolder, 'basic.ura')
  process.env[envVarName] = undefined
  expect(parsedData).toEqual(expectedBasic)
})

/** Tests multiline basic strings. */
test('string_basic_multiline', () => {
  const envVarName = 'env_var_value'
  process.env[envVarName] = 'Roses'
  const parsedData = getFileContentParsed(parentFolder, 'multiline_basic.ura')
  process.env[envVarName] = undefined
  expect(parsedData).toEqual(expectedMultilineBasic)
})

/** Tests errors in basic strings. */
test('string_errors', () => {
  const timeNs = process.hrtime()[1]
  expect(() => {
    parse(`test: "$false_var_${timeNs}"`)
  }).toThrow(VariableNotDefinedError)
})

/** Tests literal strings. */
test('literal_strings', () => {
  const parsedData = getFileContentParsed(parentFolder, 'literal.ura')
  expect(parsedData).toEqual(expectedLiteral)
})

/** Tests multiline literal strings. */
test('multiline_literal_strings', () => {
  const parsedData = getFileContentParsed(parentFolder, 'multiline_literal.ura')
  expect(parsedData).toEqual(expectedMultilineLiteral)
})
