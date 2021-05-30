import { InvalidIndentationError } from '../../src/index'
import { getFileContentParsed } from '../utils'

const parentFolder = 'indentation'

/** Tests raising an error when both whitespace and tabs are used at the time for indentation. */
test('wrong_indentation_char', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'different_chars.ura')
  }).toThrow(InvalidIndentationError)
})

/** Tests raising an error when indentation is not divisible by 4. */
test('indentation_not_divisible_by_4', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'not_divisible_by_4.ura')
  }).toThrow(InvalidIndentationError)
})

/** Tests raising an error when two levels of an object are not separated by only 4 spaces of difference. */
test('indentation_not_divisible_by_4', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'more_than_4_difference.ura')
  }).toThrow(InvalidIndentationError)
})

/** Tests raising an error when tab character is used as indentation. */
test('indentation_not_divisible_by_4', () => {
  expect(() => {
    getFileContentParsed(parentFolder, 'with_tabs.ura')
  }).toThrow(InvalidIndentationError)
})
