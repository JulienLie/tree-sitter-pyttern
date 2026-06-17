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

  word: $ => $._identifier_terminal,

  conflicts: ($, original) => [
    [$.identifier, $.pattern],
    [$.subpattern_statements],
    ...original
  ],

  rules: {
    _identifier_terminal: _ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,
    
    simple_wildcard: _ => token(prec(10, '?')),
    multiple_wildcard: _ => token(prec(10, '?*')),
    number_wildcard: _ => token(prec(10, /\?\{[ \t]*[0-9]+[ \t]*(,[ \t]*[0-9]*[ \t]*)?\}/)),
    var_wildcard: $ => seq(
        token(prec(10, '?')),
        field("name", alias($._identifier_terminal, $.identifier))
    ),

    identifier: ($, _) => choice(
      $._any_wildcard,
      $._identifier_terminal
    ),

    pattern: ($, original) => choice(
      $._any_wildcard,
      original
    ),

    expression: ($, original) => choice(
      prec(10, $._any_wildcard),
      original
    ),

    _any_wildcard: $ => choice(
      $.call_wildcard,
      $.var_wildcard,
      $.contains_wildcard,
      $.simple_wildcard,
      $.multiple_wildcard,
      $.number_wildcard
    ),

    _expr_wildcard: $ => $._any_wildcard,

    call_wildcard: $ => prec.right(seq(
      token(prec(30, '?$')),
      field("name", $.identifier),
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
      field("name", $.identifier),
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
      field("name", $.identifier),
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

    _compound_statement: ($, original) => 
      choice(
        $.compound_wildcard,
        $.multiple_compound_wildcard,
        $.subpattern_statements,
        original
      )
  }
});
