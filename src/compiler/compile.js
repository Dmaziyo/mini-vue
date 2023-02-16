import { generate } from './codegen'
import { baseParse } from './parse'

export function compile(template) {
  const ast = baseParse(template)
  return generate(ast)
}
