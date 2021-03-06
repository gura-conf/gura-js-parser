import { ParseError } from './errors'

/** Internal use for bad ranges. */
class ValueError extends Error {
  constructor (message?: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = ValueError.name
  }
}

type Rule = () => any

/**
 * Base parser.
 */
class Parser {
  protected text: string
  protected pos: number
  protected line: number
  protected len: number
  private cache: {[key: string]: string[]}

  constructor () {
    this.cache = {}
  }

  /**
   * Checks that the parser has reached the end of file, otherwise it will raise a ParseError.
   *
   * @throws ParseError if EOL has not been reached.
   */
  assertEnd () {
    if (this.pos < this.len) {
      const errorPos = this.pos + 1
      throw new ParseError(
        errorPos,
        this.line,
        `Expected end of string but got "${this.text[errorPos]}"`
      )
    }
  }

  /**
   * Generates a list of char from a list of char which could container char ranges(i.e.a - z or 0 - 9).
   *
   * @param chars - List of chars to process.
   * @returns List of char with ranges processed.
   */
  splitCharRanges (chars: string): string[] {
    if (this.cache[chars] !== undefined) {
      return this.cache[chars]
    }

    const result: string[] = []
    let index = 0
    const length = chars.length

    while (index < length) {
      if (index + 2 < length && chars[index + 1] === '-') {
        if (chars[index] >= chars[index + 2]) {
          throw new ValueError('Bad character range')
        }

        result.push(chars.substring(index, index + 3))
        index += 3
      } else {
        result.push(chars[index])
        index += 1
      }
    }

    this.cache[chars] = result
    return result
  }

  /**
   * Matches a list of specific chars and returns the first that matched.If any matched, it will raise a ParseError.
   *
   * @param chars - Chars to match.If it is null, it will return the next char in text.
   * @throws ParseError if any of the specified char(i.e.if chars != null) matched.
   * @returns Matched char.
   */
  char (chars: string | null = null): string {
    if (this.pos >= this.len) {
      const param = chars === null ? 'next character' : `[${chars}]`
      throw new ParseError(
        this.pos + 1,
        this.line,
        `Expected ${param} but got end of string`
      )
    }

    const nextChar = this.text[this.pos + 1]
    if (chars === null) {
      this.pos += 1
      return nextChar
    }

    for (const charRange of this.splitCharRanges(chars)) {
      if (charRange.length === 1) {
        if (nextChar === charRange) {
          this.pos += 1
          return nextChar
        }
      } else {
        if (charRange[0] <= nextChar && nextChar <= charRange[2]) {
          this.pos += 1
          return nextChar
        }
      }
    }

    throw new ParseError(
      this.pos + 1,
      this.line,
      `Expected [${chars}] but got "${nextChar}"`
    )
  }

  /**
   * Matches specific keywords.
   *
   * @param keywords - Keywords to match.
   * @throws ParseError if any of the specified keywords matched.
   * @returns The first matched keyword.
   */
  keyword (keywords: string[]): string {
    if (this.pos >= this.len) {
      throw new ParseError(
        this.pos,
        this.line,
        `Expected "${keywords.join(', ')}" but got end of string`
      )
    }

    for (const keyword of keywords) {
      const low = this.pos + 1
      const high = low + keyword.length

      if (this.text.substring(low, high) === keyword) {
        this.pos += keyword.length
        return keyword
      }
    }

    const errorPos = this.pos + 1
    throw new ParseError(
      errorPos,
      this.line,
      `Expected "${keywords.join(', ')}" but got "${this.text[errorPos]}"`
    )
  }

  /**
   * Matches specific rules which name must be implemented as a method in corresponding parser.A rule does not match
   * if its method raises ParseError.
   *
   * @param rules - Rules to match.
   * @throws ParseError if any of the specified rules matched.
   * @returns The first matched rule method's result.
   */
  match (rules: Rule[]): any {
    let lastErrorPos = -1
    let lastException: Error | null = null
    let lastErrorRules = []

    for (const rule of rules) {
      const initialPos = this.pos
      const initialLine = this.line
      try {
        return rule()
      } catch (ex) {
        if (ex instanceof ParseError) {
          this.pos = initialPos
          this.line = initialLine

          if (ex.pos > lastErrorPos) {
            lastException = ex
            lastErrorPos = ex.pos
            lastErrorRules = []
            lastErrorRules.push(rule)
          } else {
            if (ex.pos === lastErrorPos) {
              lastErrorRules.push(rule)
            }
          }
        } else {
          // If it is not a ParseError, throws to stop parsing
          throw ex
        }
      }
    }

    if (lastErrorRules.length === 1) {
      throw lastException
    } else {
      lastErrorPos = Math.min(this.text.length - 1, lastErrorPos)
      throw new ParseError(
        lastErrorPos,
        this.line,
        `Expected ${lastErrorRules.map((e) => e.name.substring(6)).join(', ')} but got "${this.text[lastErrorPos]}"`
      )
    }
  }

  /**
   * Like char() but returns null instead of raising ParseError.
   *
   * @param chars - Chars to match. If it is null, it will return the next char in text.
   * @returns Char if matched, null otherwise.
   */
  maybeChar (chars: string | null = null): string | null {
    try {
      return this.char(chars)
    } catch (ex) {
      if (ex instanceof ParseError) {
        return null
      }
      // If it is not a ParseError, throws to stop parsing
      throw ex
    }
  }

  /**
   * Like match() but returns null instead of raising ParseError.
   *
   * @param rules - Rules to match.
   * @returns Rule result if matched, null otherwise.
   */
  maybeMatch (rules: Rule[]): any | null {
    try {
      return this.match(rules)
    } catch (ex) {
      if (ex instanceof ParseError) {
        return null
      }
      // If it is not a ParseError, throws to stop parsing
      throw ex
    }
  }

  /**
   * Like keyword() but returns null instead of raising ParseError.
   *
   * @param keywords - Keywords to match.
   * @returns Keyword if matched, null otherwise.
   */
  maybeKeyword (keywords: string[]): string | null {
    try {
      return this.keyword(keywords)
    } catch (ex) {
      if (ex instanceof ParseError) {
        return null
      }
      // If it is not a ParseError, throws to stop parsing
      throw ex
    }
  }
}

export { Parser, ParseError }
