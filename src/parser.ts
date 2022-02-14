import { Token, TokenType } from './scanner';

const isBinaryOperator = (type: TokenType) =>
	[
		TokenType.PLUS,
		TokenType.MINUS,
		TokenType.STAR,
		TokenType.SLASH,
		TokenType.CARET,
	].includes(type);

const getInfixBP = (type: TokenType): [number, number] => {
	switch (type) {
		case TokenType.PLUS:
		case TokenType.MINUS:
			return [1, 2];
		case TokenType.STAR:
		case TokenType.SLASH:
			return [3, 4];
		case TokenType.CARET:
			return [8, 7];
		default:
			throw new Error('Bad operator');
	}
};

class Expr {
	toString() {
		return '';
	}
}

class VarExpr extends Expr {
	token: Token;

	constructor(token: Token) {
		super();
		this.token = token;
	}

	toString() {
		return this.token.lexeme;
	}
}

class NumberExpr extends Expr {
	token: Token;

	constructor(token: Token) {
		super();
		this.token = token;
	}

	toString() {
		return this.token.lexeme;
	}
}

class BinaryExpr extends Expr {
	operator: Token;
	left: Expr;
	right: Expr;

	constructor(operator: Token, left: Expr, right: Expr) {
		super();
		this.operator = operator;
		this.left = left;
		this.right = right;
	}

	toString() {
		return `(${
			this.operator.lexeme
		} ${this.left.toString()} ${this.right.toString()})`;
	}
}

export class Parser {
	tokens: Token[];
	current: number;

	constructor(tokens: Token[]) {
		this.tokens = tokens;
		this.current = 0;
	}

	atEnd() {
		return this.tokens.length === this.current;
	}

	peek() {
		return this.tokens[this.current];
	}

	next() {
		return this.tokens[this.current++];
	}

	match(type: TokenType) {
		if (this.peek().type === type) {
			this.next();
			return true;
		}
		return false;
	}

	parse(minBP: number) {
		let lhs: Expr;

		const token = this.next();

		switch (token.type) {
			case TokenType.IDENTIFIER:
				lhs = new VarExpr(token);
				break;
			case TokenType.NUMBER:
				lhs = new NumberExpr(token);
				break;
			default:
				throw new Error('Bad token');
		}

		while (this.peek()) {
			let operator = this.peek();

			if (!isBinaryOperator(operator.type)) {
				throw new Error('Bad token');
			}

			const [leftBP, rightBP] = getInfixBP(operator.type);

			if (minBP > leftBP) break;

			this.next();

			const rhs = this.parse(rightBP);

			lhs = new BinaryExpr(operator, lhs, rhs);
		}

		return lhs;
	}
}
