module.exports = grammar({
    name: "kframework",

    rules: {
        source_file: $ => seq(
            repeat($.require),
            repeat(choice($.comment, $.module))
        ),

        require: $ => seq('require', $.require_file),
        require_file: $ => /"[A-Za-z0-9.]+"/,

        // Module definition {{{
        module: $ => seq(
            'module',
            $.module_name,
            repeat($.imports),
            repeat($.sentence),
            'endmodule'
        ),
        // }}}

        // Imports {{{
        imports: $ => seq('imports', $.module_name),
        module_name: $ => /#?(\w|-)+/,
        /// }}}

        sentence: $ => choice(
            $.claim,
            $.context,
            $.configuration,
            $.rule,
            $.syntax,
            $.comment
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

        // Rule definition {{{
        rule: $ => seq('rule', $._rule_lhs, '=>', $._rule_rhs),

        _rule_lhs: $ => /.*/,
        _rule_rhs: $ => /.+/,
        // }}}

        // Syntax definition {{{
        syntax: $ => seq('syntax', $.sort_name, "::=", $.syntax_def),

        syntax_def: $ => seq(
            $.syntax_def_entry,
            repeat(seq(choice('|', '>'), $.syntax_def_entry))
        ),
        syntax_def_entry: $ => seq(
            $.syntax_def_tokens,
            $.attribute_list,
        ),
        syntax_def_tokens: $ => choice(
            repeat1(choice($.sort_name, $.quoted))

        ),
        syntax_token: $ => /"#?\w+"/,
        syntax_constructor: $ => /.+/, // seq($.identifier, '(', $._constructor_args, ')'),
        // _constructor_args: $ => seq($.sort_name, repeat(seq(',', $.sort_name))),

        attribute_list: $ => seq(
            '[',
            seq($.attribute_name, repeat(seq(',', $.attribute_name))),
            ']'
        ),
        attribute_name: $ => /[\w()]+/,
        // }}}

        // Misc {{{
        identifier: $ => /\a\w*/,
        upper_id: $ => /#?[A-Z][a-zA-Z0-9]*/,
        lower_id: $ => /#?[A-Z][a-zA-Z0-9]*/,
        sort_name: $ => choice($.builtin_sort, $.upper_id),
        builtin_sort: $ => choice("Bool", "String", "Int"),
        comment: $ => seq('//', /.*/),
        quoted: $ => /".*"/,
        // }}}
    },

    inline: $ => [
        $.upper_id, $.lower_id, $.attribute_name, $.quoted, $.builtin_sort
    ]
})
