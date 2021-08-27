module.exports = grammar({
    name: "kframework",
    extras: $ => [
        /\s/,
        $.comment
    ],
    inline: $ => [
        $.attribute_name,
        $.builtin_sort
    ],
    rules: {
        source_expression: $ => seq(
            repeat($.require),
            repeat($.module)
        ),

        require: $ => seq('require', $.string),
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
        configuration: $ => seq("configuration", $.cell),
        cell: $ => seq($.cell_open, $._cell_content, $.cell_close),
        cell_open: $ => seq('<', /[a-zA-Z_](\w|-)*/, '>'),
        _cell_content: $ => choice(
            /([$:.]|\w)+/,
            repeat1($.cell),
        ),
        cell_close: $ => seq('</', /[a-zA-Z_](\w|-)*/, '>'),
        // }}}
        // Syntax definition {{{
        syntax: $ => seq('syntax', $.sort, "::=", $.syntax_def),
        syntax_def: $ => sep1($.syntax_def_entry, /[|>]/),
        syntax_def_entry: $ => seq(choice($._constr, $._app), optional($.attr_list)),

        _constr: $ => seq(alias($._lower_id, $.constr_name), $._constr_args),
        _constr_args: $ => seq('(', sep1(alias($.sort, 'function argument'), ','), ')'),
        _app: $ => repeat1(choice($.string, $.sort)),

        attr_list: $ => seq('[', sep1(choice($._attr, $._attr_constr), ','), ']'),
        _attr: $ => /[a-z]+/,
        _attr_constr: $ => seq($._attr, $._attr_constr_args),
        _attr_constr_args: $ => seq('(', sep1($._attr_constr_arg, ','), ')'),
        _attr_constr_arg: $ => /\w+/,
        // }}}
        // Rule definition {{{
        rule: $ => seq('rule', $._rule_lhs, '=>', $._rule_rhs),

        _rule_lhs: $ => /.*/,
        _rule_rhs: $ => /.+/,
        // }}}
        // Misc {{{
        _upper_id: $ => /#?[A-Z][a-zA-Z0-9]*/,
        _lower_id: $ => /#?[a-z][a-zA-Z0-9]*/,
        sort: $ => choice($.builtin_sort, $._upper_id),
        builtin_sort: $ => choice("Bool", "String", "Int"),
        comment: $ => token(seq('//', /.*/)),
        string: $ => seq('"', optional($._str_content), '"'),
        _str_content: $ => /[^"]+/,
        // }}}
    }
})

function sep1(rule, separator) {
    return seq(rule, repeat(seq(separator, rule)));
}
function between(rule, c) {
    return seq(c, rule, c);
}
