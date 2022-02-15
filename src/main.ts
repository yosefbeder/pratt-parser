import { Scanner } from './scanner';
import { Parser } from './parser';

function main() {
	const scanner = new Scanner('(-a[1])? 2: (3)? 4: 5');
	const tokens = scanner.scan();
	const parser = new Parser(tokens);

	console.log(parser.parse(0).toString());
}

main();
