import { Token, TokenType } from './scanner';

const getPostfixBP = (type: TokenType): [number, null] => {
	switch (type) {
		case TokenType.BANG:
		case TokenType.LEFT_BRACE:
			return [6, null];
		default:
			throw new Error(`Bad operator ${type}`);
	}
};

const getPrefixBP = (type: TokenType): [null, number] => {
	switch (type) {
		case TokenType.PLUS:
		case TokenType.MINUS:
			return [null, 5];
		default:
			throw new Error(`Bad operator ${type}`);
	}
};

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
			throw new Error(`Bad operator ${type}`);
	}
};

abstract class Expr {
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

class UnaryExpr extends Expr {
	operator: Token;
	operand: Expr;

	constructor(operator: Token, operand: Expr) {
		super();
		this.operator = operator;
		this.operand = operand;
	}

	toString() {
		return `(${this.operator.lexeme} ${this.operand.toString()})`;
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
	parenDepth: number;
	braceDepth: number;

	constructor(tokens: Token[]) {
		this.tokens = tokens;
		this.current = 0;
		this.parenDepth = 0;
		this.braceDepth = 0;
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
		if (this.peek() && this.peek().type === type) {
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
			case TokenType.PLUS:
			case TokenType.MINUS:
				const [_, rightBP] = getPrefixBP(token.type);
				const rhs = this.parse(rightBP);

				lhs = new UnaryExpr(token, rhs);
				break;
			case TokenType.LEFT_PAREN:
				this.parenDepth++;
				lhs = this.parse(0);

				if (!this.match(TokenType.RIGHT_PAREN)) {
					throw new Error('Unterminated group');
				}
				this.parenDepth--;

				break;
			default:
				throw new Error('Bad token');
		}

		while (this.peek()) {
			let operator = this.peek();

			try {
				const [leftBP, _] = getPostfixBP(operator.type);

				if (minBP > leftBP) break;

				this.next();

				if (operator.type === TokenType.BANG) {
					lhs = new UnaryExpr(operator, lhs);
				} else if (operator.type === TokenType.LEFT_BRACE) {
					this.braceDepth++;
					const rhs = this.parse(0);

					if (!this.match(TokenType.RIGHT_BRACE)) {
						throw new Error('Unterminated array retrieval');
					}
					this.braceDepth--;

					lhs = new BinaryExpr(operator, lhs, rhs);
				}

				continue;
			} catch (error) {
				if (operator.type === TokenType.LEFT_BRACE) throw error;
			}

			try {
				const [leftBP, rightBP] = getInfixBP(operator.type);

				if (minBP > leftBP) break;

				this.next();

				const rhs = this.parse(rightBP);

				lhs = new BinaryExpr(operator, lhs, rhs);
				continue;
			} catch (error) {
				if (operator.type === TokenType.RIGHT_PAREN && this.parenDepth) break;
				else if (operator.type === TokenType.RIGHT_BRACE && this.braceDepth)
					break;
				else throw error;
			}
		}

		return lhs;
	}
}
