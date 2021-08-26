module EXERCISE_1-SYNTAX
    syntax Bool ::=
        "true"
      | "false"
      | not(Bool) [function]

    rule not(false) => true
    rule not(true) => false

    configuration <k> $PGM:Pgm </k>
endmodule
