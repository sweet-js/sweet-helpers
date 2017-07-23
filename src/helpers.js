'lang sweet.js';
// @flow

type IdentifierCode = 0
type KeywordCode = 1
type PunctuatorCode = 2
type NumericLiteralCode = 3
type StringLiteralCode = 4
type TemplateElementCode = 5
type TemplateCode = 6
type RegExpCode = 7

type Codes = IdentifierCode | KeywordCode | PunctuatorCode | NumericLiteralCode | StringLiteralCode | TemplateElementCode | TemplateCode | RegExpCode

type IdentifierToken = {
  typeCode: IdentifierCode;
  value: string
}
type KeywordToken = {
  typeCode: KeywordCode;
  value: string;
}
type PunctuatorToken = {
  typeCode: PunctuatorCode;
  value: string;
}
type NumericLiteralToken = {
  typeCode: NumericLiteralCode;
  value: number;
}
type StringLiteralToken = {
  typeCode: StringLiteralCode;
  str: string
}
type TemplateElementToken = {
  typeCode: TemplateElementCode;
  value: string;
}
type TemplateToken = {
  typeCode: TemplateCode;
  items: Token[];
}
type RegExpToken = {
  typeCode: RegExpCode;
  value: string;
}
type Token = IdentifierToken | KeywordToken | PunctuatorToken | NumericLiteralToken | StringLiteralToken | TemplateElementToken | TemplateToken | RegExpToken

interface Syntax {
  token: Token;
  fromIdentifier(v: string): Syntax;
  fromKeyword(v: string): Syntax;
  fromPunctuator(v: string): Syntax;
  fromNumber(n: number): Syntax;
  fromString(s: string): Syntax;
  from(kind: string, x: any): Syntax
}

type RawSyntax = {
  type: 'RawSyntax';
  value: Syntax;
}
type RawDelimiter = {
  type: 'RawDelimiter';
  kind: 'braces' | 'parens' | 'brackets' | 'syntaxTemplate';
  inner: Term[]
}

export type Term = RawSyntax | RawDelimiter

const TypeCodes = {
  Identifier: 0,
  Keyword: 1,
  Punctuator: 2,
  NumericLiteral: 3,
  StringLiteral: 4,
  TemplateElement: 5,
  Template: 6,
  RegExp: 7,
};

function check(obj: Term, type: Codes): boolean {
  return obj && obj.type === 'RawSyntax' && obj.value.token.typeCode === type;
}

export function unwrap(obj: ?Term): { value?: any } {
  if (obj == null) return {};
  if (obj.type === 'RawSyntax') {
    if (obj.value.token.typeCode === TypeCodes.StringLiteral) {
      return {
        value: obj.value.token.str
      };
    } else if (obj.value.token.typeCode === TypeCodes.Template) {
      return {
        value: obj.value.token.items
      };
    } else {
      return {
        value: obj.value.token.value
      };
    }
  } else if (obj.type === 'RawDelimiter') {
    return {
      value: obj.inner,
    };
  }
  return {};
}

export function isIdentifier(obj: Term) {
  return check(obj, TypeCodes.Identifier);
}

export function fromIdentifier(obj: RawSyntax, x: string) {
  return obj.value.fromIdentifier(x);
}

export function isKeyword(obj: Term) {
  return check(obj, TypeCodes.Keyword);
}

export function fromKeyword(obj: RawSyntax, x: string) {
  return obj.value.fromKeyword(x);
}

export function isPunctuator(obj: Term) {
  return check(obj, TypeCodes.Punctuator);
}

export function fromPunctuator(obj: RawSyntax, x: string) {
  return obj.value.fromPunctuator(x);
}

export function isNumericLiteral(obj: Term) {
  return check(obj, TypeCodes.NumericLiteral);
}

export function fromNumericLiteral(obj: RawSyntax, x: number) {
  return obj.value.fromNumber(x);
}

export function isStringLiteral(obj: Term) {
  return check(obj, TypeCodes.StringLiteral);
}

export function fromStringLiteral(obj: RawSyntax, x: string) {
  return obj.value.fromString(x);
}

export function isTemplateElement(obj: Term) {
  return check(obj, TypeCodes.TemplateElement);
}

export function isTemplate(obj: Term) {
  return check(obj, TypeCodes.Template);
}

export function isRegExp(obj: Term) {
  return check(obj, TypeCodes.RegExp);
}

export function isDelimiter(obj: Term) {
  return obj && obj.type === 'RawDelimiter';
}

export function isParens(obj: Term) {
  return obj && obj.type === 'RawDelimiter' && obj.kind === 'parens';
}

export function fromParens(obj: RawSyntax, x: Term[]) {
  return obj.value.from('parens', x);
}

export function isBrackets(obj: Term) {
  return obj && obj.type === 'RawDelimiter' && obj.kind === 'brackets';
}

export function fromBrackets(obj: RawSyntax, x: Term[]) {
  return obj.value.from('brackets', x);
}

export function isBraces(obj: Term) {
  return obj && obj.type === 'RawDelimiter' && obj.kind === 'braces';
}

export function fromBraces(obj: RawSyntax, x: Term[]) {
  return obj.value.from('braces', x);
}

export function isSyntaxTemplate(obj: Term) {
  return obj && obj.type === 'RawDelimiter' && obj.kind === 'syntaxTemplate';
}