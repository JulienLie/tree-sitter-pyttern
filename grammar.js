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
    ...original
  ],

  rules: {
    simple_wildcard: _ => token('?'),
    multiple_wildcard: _ => token('?*'),
    compound_wildcard: $ => seq(
      token("?:"),
      field("body", $._suite)
    ),
    multiple_compound_wildcard: $ => seq(
      token("?:*"),
      field("body", $._suite)
    ),

    // `original` is passed in automatically because we're overriding an existing rule name
    identifier: ($, _) =>
      choice(
        $.simple_wildcard,
        $._python_identifier
      ),

    _python_identifier: _ => /[_\p{XID_Start}][_\p{XID_Continue}]*/,

    _simple_statement: ($, original) => 
      choice(
        $.simple_wildcard,
        $.multiple_wildcard,
        original
      ),

    _compound_statement: ($, original) => 
      choice(
        $.compound_wildcard,
        $.multiple_compound_wildcard,
        original
      )
  }
});