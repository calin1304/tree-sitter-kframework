module.exports = grammar({
    name: "kframework",
    extras: $ => [
        /\s/,
        $.comment
    ],
    inline: $ => [
    ],
    rules: {
        source_expression: $ => seq(
            repeat($.require),
            repeat($.module)
        ),

        // Misc {{{
        _upper_id: $ => /#?[A-Z][a-zA-Z0-9]*/,
        _lower_id: $ => /#?[a-z][a-zA-Z0-9]*/,
        sort: $ => choice($._builtin_sort, $._upper_id),
        _builtin_sort: $ => choice("Bool", "String", "Int"),
        comment: $ => token(seq('//', /.*/)),
        string: $ => seq('"', optional($._str_content), '"'),
        _str_content: $ => /[^"]+/,
        // }}}

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
        // Sentence {{{
        _sentence: $ => choice(
            $.claim,
            $.context,
            $.configuration,
            $.rule,
            $.syntax,
        ),
        // }}}
        claim: $ => "claim",
        context: $ => "context",
        // Configuration {{{
        configuration: $ => seq("configuration", $.cell),
        cell: $ => seq($.cell_open, $._cell_content, $.cell_close),
        cell_open: $ => tag_open(/[a-zA-Z_](\w|-)*/),
        _cell_content: $ => choice(
            /([$:.]|\w)+/,
            repeat1($.cell),
        ),
        cell_close: $ => tag_close(/[a-zA-Z_](\w|-)*/),
        // }}}
        // Syntax definition {{{
        syntax: $ => seq('syntax', $.sort, "::=", $.syntax_def),
        syntax_def: $ => sep1($.syntax_def_entry, /[|>]/),
        syntax_def_entry: $ => seq(choice($._constr, $._app), optional($.attr_list)),

        _constr: $ =>
            call(alias($._lower_id, $.constr_name), alias($.sort, 'function argument')),
        _app: $ => repeat1(choice($.string, $.sort)),

        attr_list: $ => brackets(sep1(choice($._attr, $._attr_constr), ',')),
        _attr: $ => /[a-z]+/,
        _attr_constr: $ => call($._attr, $._attr_constr_arg),
        _attr_constr_arg: $ => /\w+/,
        // }}}
        // Rule definition {{{
        rule: $ => seq('rule', $.rule_lhs, '=>', $.rule_rhs),
        rule_lhs: $ => /[^=>]*/,
        rule_rhs: $ => /.+/,
        // }}}
    }
})

function sep1(rule, separator) {
    return seq(rule, repeat(seq(separator, rule)));
}
function between(open, rule, close) {
    return seq(open, rule, close);
}
function tag_open(rule) {
    return between('<', rule, '>');
}
function tag_close(rule) {
    return between('</', rule, '>');
}
function parans(rule) {
    return between('(', rule, ')');
}
function brackets(rule) {
    return between('[', rule, ']');
}
// C-like function calls: foo(bar1, bar2, bar3)
function call(func, arg) {
    return seq(func, parans(sep1(arg, ',')));
}
