import { getFileContentParsed } from '../utils'

const parentFolder = 'useless-lines'

const expected = {
  a_string: 'test string',
  int1: +99,
  int2: 42,
  int3: 0,
  int4: -17,
  int5: 1000,
  int6: 5349221,
  int7: 5349221
}

const expectedObject = {
  testing: {
    test_2: 2,
    test: {
      name: 'JWARE',
      surname: 'Solutions'
    }
  }
}

const expectedObjectComplex = {
  testing: {
    test: {
      name: 'JWARE',
      surname: 'Solutions',
      skills: {
        good_testing: false,
        good_programming: false,
        good_english: false
      }
    },
    test_2: 2,
    test_3: {
      key_1: true,
      key_2: false,
      key_3: 55.99
    }
  }
}

/** Tests without comments or blank lines. */
test('without_useless_lines', () => {
  const parsedData = getFileContentParsed(parentFolder, 'without.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests with comments or blank lines on the top of the file. */
test('on_top', () => {
  const parsedData = getFileContentParsed(parentFolder, 'on_top.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests with comments or blank lines on the bottom of the file. */
test('on_bottom', () => {
  const parsedData = getFileContentParsed(parentFolder, 'on_bottom.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests with comments or blank lines on the top and bottom of the file. */
test('on_both', () => {
  const parsedData = getFileContentParsed(parentFolder, 'on_both.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests with comments or blank lines in the middle of valid sentences. */
test('in_the_middle', () => {
  const parsedData = getFileContentParsed(parentFolder, 'in_the_middle.ura')
  expect(parsedData).toEqual(expected)
})

/** Tests without comments or blank lines in the middle of valid object. */
test('without_object', () => {
  const parsedData = getFileContentParsed(parentFolder, 'without_object.ura')
  expect(parsedData).toEqual(expectedObject)
})

/** Tests with comments or blank lines in the middle of valid object. */
test('in_the_middle_object', () => {
  const parsedData = getFileContentParsed(parentFolder, 'in_the_middle_object.ura')
  expect(parsedData).toEqual(expectedObject)
})

/** Tests with comments or blank lines in the middle of valid complex object. */
test('in_the_middle_object_complex', () => {
  const parsedData = getFileContentParsed(parentFolder, 'in_the_middle_object_complex.ura')
  expect(parsedData).toEqual(expectedObjectComplex)
})
