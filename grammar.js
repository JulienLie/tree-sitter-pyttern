/**
 * @file Grammar for the Pyttern Query Language
 * @author Julien Liénard <julien.lienard@uclouvain.be>
 * @license MIT
 */

const python = require("tree-sitter-python/grammar");

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar(python,{
  name: "pyttern",

  rules: {
    // TODO: add the actual grammar rules
    //source_file: $ => "hello"
  }
});
