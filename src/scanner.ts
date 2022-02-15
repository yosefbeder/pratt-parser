const isSpace = (character: string) => /\s/.test(character);

const isDigit = (character: string) => /[0-9]/.test(character);

export enum TokenType {
	NUMBER,
	IDENTIFIER,
	PLUS,
	MINUS,
	STAR,
	SLASH,
	CARET,
	BANG,
	LEFT_PAREN,
	RIGHT_PAREN,
	LEFT_BRACE,
	RIGHT_BRACE,
	QUESTION_MARK,
	COLON,
}

export class Token {
	type: TokenType;
	lexeme: string;

	constructor(type: TokenType, lexeme: string) {
		this.type = type;
		this.lexeme = lexeme;
	}
}

export class Scanner {
	source: string;
	start: number;
	current: number;

	constructor(source: string) {
		this.source = source;
		this.start = 0;
		this.current = 0;
	}

	peek() {
		return this.source[this.current];
	}

	next() {
		return this.source[this.current++];
	}

	match(character: string) {
		if (this.peek() === character) {
			this.next();
			return true;
		}

		return false;
	}

	atEnd() {
		return this.source.length === this.current;
	}

	popToken(type: TokenType) {
		const lexeme = this.source.slice(this.start, this.current);
		const token = new Token(type, lexeme);

		this.start = this.current;

		return token;
	}

	scan() {
		const tokens = [];

		while (!this.atEnd()) {
			if (isSpace(this.peek())) {
				this.next();
				this.start = this.current;
			} else if (this.match('+')) {
				tokens.push(this.popToken(TokenType.PLUS));
			} else if (this.match('-')) {
				tokens.push(this.popToken(TokenType.MINUS));
			} else if (this.match('*')) {
				tokens.push(this.popToken(TokenType.STAR));
			} else if (this.match('/')) {
				tokens.push(this.popToken(TokenType.SLASH));
			} else if (this.match('^')) {
				tokens.push(this.popToken(TokenType.CARET));
			} else if (this.match('!')) {
				tokens.push(this.popToken(TokenType.BANG));
			} else if (this.match('(')) {
				tokens.push(this.popToken(TokenType.LEFT_PAREN));
			} else if (this.match(')')) {
				tokens.push(this.popToken(TokenType.RIGHT_PAREN));
			} else if (this.match('[')) {
				tokens.push(this.popToken(TokenType.LEFT_BRACE));
			} else if (this.match(']')) {
				tokens.push(this.popToken(TokenType.RIGHT_BRACE));
			} else if (this.match('?')) {
				tokens.push(this.popToken(TokenType.QUESTION_MARK));
			} else if (this.match(':')) {
				tokens.push(this.popToken(TokenType.COLON));
			} else if (isDigit(this.peek())) {
				this.next();

				while (isDigit(this.peek())) this.next();

				tokens.push(this.popToken(TokenType.NUMBER));
			}
		}

		return tokens;
	}
}
