import { DuplicatedVariableError, parse, ParseError, VariableNotDefinedError } from '../../src/index'
import { getFileContentParsed } from '../utils'

const parentFolder = 'variables'

const expected = {
  plain: 5,
  in_array_middle: [1, 5, 3],
  in_array_last: [1, 2, 5],
  in_object: {
    name: 'Aníbal',
    surname: 'Troilo',
    year_of_birth: 1914
  }
}

/** Tests variables definition. */
test('variables_normal', () => {
  const parsedData = getFileContentParsed(parentFolder, 'normal.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests errors in variables definition. */
test('variables_with_error', () => {
  const timeNs = process.hrtime()[1]
  expect(() => {
    parse(`test: $false_var_${timeNs}`)
  }).toThrow(VariableNotDefinedError)
})

/** Tests errors when a variable is defined more than once. */
test('variables_with_error_duplicated', () => {
  expect(() => {
    parse('$a_var: 14\n$a_var: 14')
  }).toThrow(DuplicatedVariableError)
})

/** Tests using environment variables. */
test('env_vars', () => {
  const timeNs = process.hrtime()[1]
  const envVarName = `env_var_${timeNs}`
  const envValue = 'using_env_var'
  process.env[envVarName] = envValue

  // Parses and tests
  const parsedData = parse(`test: $${envVarName}`)
  expect(parsedData).toEqual({ test: envValue })
  process.env[envVarName] = undefined
})

/** Tests invalid variable value type. */
test('invalid_variable', () => {
  expect(() => {
    parse('$invalid: true')
  }).toThrow(ParseError)
})

/** Tests invalid variable value type. */
test('invalid_variable_2', () => {
  expect(() => {
    parse('$invalid: false')
  }).toThrow(ParseError)
})

/** Tests invalid variable value type. */
test('invalid_variable_3', () => {
  expect(() => {
    parse('$invalid: null')
  }).toThrow(ParseError)
})

/** Tests invalid variable value type. */
test('invalid_variable_4', () => {
  expect(() => {
    parse('$invalid: [ 1, 2, 3]')
  }).toThrow(ParseError)
})

/** Tests invalid variable value type. */
test('invalid_variable_5', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'invalid_variable_with_object.ura')
  }).toThrow(ParseError)
})
