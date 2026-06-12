/**
 * @file Grammar for the Pyttern Query Language
 * @author Julien Liénard <julien.lienard@uclouvain.be>
 * @license MIT
 */

const python = require("tree-sitter-python/grammar");

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar(python, {
  name: "pyttern",

  word: $ => $._python_identifier,

  conflicts: ($, original) => [
    [$._simple_statements, $.identifier],
    [$.subpattern_statements],
    ...original
  ],

  rules: {
    _python_identifier: _ => token(/[_\p{XID_Start}][_\p{XID_Continue}]*/),

    simple_wildcard: _ => token(prec(10, '?')),
    multiple_wildcard: _ => token(prec(10, '?*')),
    number_wildcard: _ => token(prec(10, /\?\{[ \t]*[0-9]+[ \t]*(,[ \t]*[0-9]*[ \t]*)?\}/)),
    var_wildcard: _ => token(prec(10, /\?[_\p{XID_Start}][_\p{XID_Continue}]*/)),

    _wildcard: $ => choice(
      $.multiple_wildcard,
      $.number_wildcard,
      $.var_wildcard,
      $.simple_wildcard,
      $.contains_wildcard,
      $.call_wildcard
    ),

    call_wildcard: $ => prec.right(seq(
      token(prec(30, '?$')),
      field("name", alias($._python_identifier, $.identifier)),
      '(',
      optional($.subpattern_args),
      ')',
      optional(seq(':', field("body", $._suite)))
    )),

    subpattern_statements: $ => seq(
      $.subpattern_definition,
      repeat1($.transformation)
    ),

    subpattern_definition: $ => choice(
      $.compound_subpattern,
      seq($.simple_subpattern, $._newline)
    ),

    simple_subpattern: $ => seq(
      '$',
      field("type", $.subpattern_type),
      field("name", alias($._python_identifier, $.identifier)),
      '(',
      optional($.subpattern_args),
      ')'
    ),

    subpattern_type: _ => choice('&', '|', '!'),

    compound_subpattern: $ => seq(
      $.simple_subpattern,
      ':',
      field("body", $._suite)
    ),

    subpattern_args: $ => seq(
      $.subpattern_arg,
      repeat(seq(',', $.subpattern_arg)),
      optional(',')
    ),

    subpattern_arg: $ => seq(
      $.primary_expression,
      optional(seq('=', $.expression))
    ),

    transformation: $ => seq(
      '$#',
      field("name", alias($._python_identifier, $.identifier)),
      $._newline,
      $._statement
    ),

    contains_wildcard: $ => seq(
      token(prec(100, '?<{')),
      choice(
        $.expression,
        $.assignment
      ),
      token(prec(100, '}>'))
    ),

    wildcard_number: $ => /\{[ \t]*[0-9]+[ \t]*(,[ \t]*[0-9]*[ \t]*)?\}/,

    _compound_wildcard_prefix: _ => token(prec(20, '?:')),
    _multiple_compound_wildcard_prefix: _ => token(prec(20, '?:*')),

    compound_wildcard: $ => prec(10, seq(
      $._compound_wildcard_prefix,
      optional($.wildcard_number),
      field("body", $._suite)
    )),

    multiple_compound_wildcard: $ => prec(10, seq(
      $._multiple_compound_wildcard_prefix,
      field("body", $._suite)
    )),


    // `original` is passed in automatically because we're overriding an existing rule name
    identifier: ($, _) =>
      choice(
        $._python_identifier,
        $._wildcard
      ),

    _compound_statement: ($, original) => 
      choice(
        $.compound_wildcard,
        $.multiple_compound_wildcard,
        $.subpattern_statements,
        original
      )
  }
});
