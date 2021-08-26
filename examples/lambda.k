require "substitution.md"

module LAMBDA-SYNTAX
    imports DOMAINS-SYNTAX
    imports KVAR-SYNTAX

    syntax Val ::=
        KVar
      | "lambda" KVar "." Expr [binder]

    syntax Expr ::=
        Val
      | Expr Expr    [strict, left]
      | "(" Expr ")" [bracket]

    syntax Val ::= Int | Bool
    syntax Expr ::=
        "-" Int
      > Expr "*"  Expr [strict, left]
      | Expr "/"  Expr [strict]
      > Expr "+"  Expr [strict, left]
      > Expr "<=" Expr [strict]

    syntax Expr ::= "if" Expr "then" Expr "else" Expr [strict(1)]

    syntax Expr ::= "let" KVar "=" Expr "in" Expr
endmodule

module LAMBDA
    imports LAMBDA-SYNTAX
    imports SUBSTITUTION

    syntax KResult ::= Val

    // Instantiation of lambdas
    rule (lambda X:KVar . E:Expr) V:Val => E[V / X]

    // Arithmetic expression
    rule - I => 0 -Int I
    rule I1 * I2 => I1 *Int I2
    rule I1 / I2 => I1 /Int I2 requires I2 =/=Int 0
    rule I1 + I2 => I1 +Int I2
    rule I1 <= I2 => I1 <=Int I2

    // Conditionals
    rule if true then E else _ => E
    rule if false then _ else E => E

    // let expressions
    rule let X = E in E':Expr => (lambda X . E') E [macro]
    // TODO: recursive let
endmodule

