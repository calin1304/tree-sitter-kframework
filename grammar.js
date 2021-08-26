module.exports = grammar({
    name: "kframework",
    extras: $ => [
        /\s/,
        $.comment
    ],
    inline: $ => [
        $.upper_id,
        $.lower_id,
        $.attribute_name,
        $.builtin_sort
    ],
    rules: {
        source_expression: $ => seq(
            repeat($.require),
            repeat($.module)
        ),

        require: $ => seq('require', $.require_file),
        require_file: $ => /"[A-Za-z0-9./]+"/,

        // Module definition {{{
        module: $ => seq(
            'module',
            $.module_name,
            repeat($.imports),
            repeat($._sentence),
            'endmodule'
        ),
        // }}}

        // Imports {{{
        imports: $ => seq('imports', $.module_name),
        module_name: $ => /#?(\w|-)+/,
        /// }}}

        _sentence: $ => choice(
            $.claim,
            $.context,
            $.configuration,
            $.rule,
            $.syntax,
        ),

        claim: $ => "claim",
        context: $ => "context",

        // Configuration {{{
        configuration: $ => seq("configuration", $._configuration),
        _configuration: $ => seq($.cell_start, $.cell_content, $.cell_end),
        cell_start: $ => seq('<', /[a-zA-Z_](\w|-)*/, '>'),
        cell_content: $ => /.*/,
        cell_end: $ => seq('<', /[a-zA-Z_](\w|-)*/, '>'),
        // }}}

        // Syntax definition {{{
        syntax: $ => seq('syntax', $.sort_name, "::=", $.syntax_def),

        syntax_def: $ => sep1($.syntax_def_entry, '|'),
        syntax_def_entry: $ => /[a-zA-Z()"&\s]+\\n/,

        // syntax_def: $ => seq(
        //     $.syntax_def_token,
        //     repeat(seq('|', $.syntax_def_token))
        // ),
        // syntax_def_token: $ =>  /"[a-z]+"/,

        // syntax_def: $ => seq(
        //     $.syntax_def_entry,
        //     repeat(seq(choice('|', '>'), $.syntax_def_entry))
        // ),
        // syntax_def_entry: $ => seq(
        //     $.syntax_def_tokens,
        //     $.attribute_list,
        // ),
        // syntax_def_tokens: $ => choice(
        //     repeat1(choice($.sort_name, $.quoted))

        // ),
        // syntax_token: $ => /"#?\w+"/,
        // syntax_constructor: $ => /.+/, // seq($.identifier, '(', $._constructor_args, ')'),
        // // _constructor_args: $ => seq($.sort_name, repeat(seq(',', $.sort_name))),

        // attribute_list: $ => seq(
        //     '[',
        //     seq($.attribute_name, repeat(seq(',', $.attribute_name))),
        //     ']'
        // ),
        // attribute_name: $ => /[\w()]+/,
        // }}}

        // Rule definition {{{
        rule: $ => seq('rule', $._rule_lhs, '=>', $._rule_rhs),

        _rule_lhs: $ => /.*/,
        _rule_rhs: $ => /.+/,
        // }}}

        // Misc {{{
        identifier: $ => /\a\w*/,
        upper_id: $ => /#?[A-Z][a-zA-Z0-9]*/,
        lower_id: $ => /#?[A-Z][a-zA-Z0-9]*/,
        sort_name: $ => choice($.builtin_sort, $.upper_id),
        builtin_sort: $ => choice("Bool", "String", "Int"),
        comment: $ => token(seq('//', /.*/)),
        // }}}
    }
})

function sep1(rule, separator) {
    return seq(rule, repeat(seq(separator, rule)));
}
function between(rule, c) {
    return seq(c, rule, c);
}
