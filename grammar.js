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

  externals: $ => [
    $.simple_wildcard,
    $.var_wildcard,
    $.number_wildcard,
    $.multiple_wildcard,
    $._newline,
    $._indent,
    $._dedent,
    $._string_start,
    $._string_content,
    $._escape_interpolation,
    $._string_end,
    $.comment,
    $._close_paren,
    $._close_bracket,
    $._close_brace,
  ],

  conflicts: ($, original) => [
    ...original
  ],

  rules: {
    _wildcard: $ => choice(
      $.var_wildcard,
      $.number_wildcard,
      $.multiple_wildcard,
      $.simple_wildcard
    ),

    // Overrides
    primary_expression: ($, original) => choice(
      $._wildcard,
      original
    ),

    function_definition: $ => seq(
      repeat($.decorator),
      optional($.async),
      'def',
      field('name', choice($.identifier, $._wildcard)),
      field('parameters', $.parameters),
      optional(seq(
        '->',
        field('return_type', $._expression)
      )),
      ':',
      field('body', $.block)
    ),

    class_definition: $ => seq(
      repeat($.decorator),
      'class',
      field('name', choice($.identifier, $._wildcard)),
      field('superclasses', optional($.argument_list)),
      ':',
      field('body', $.block)
    ),

    _simple_statement: ($, original) => choice(
      $._wildcard,
      original
    ),
  }
});
