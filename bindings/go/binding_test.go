package tree_sitter_pyttern_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_pyttern "github.com/julienlie/tree-sitter-pyttern/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_pyttern.Language())
	if language == nil {
		t.Errorf("Error loading Pyttern grammar")
	}
}
