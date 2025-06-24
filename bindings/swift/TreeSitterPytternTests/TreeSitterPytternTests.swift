import XCTest
import SwiftTreeSitter
import TreeSitterPyttern

final class TreeSitterPytternTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_pyttern())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Pyttern grammar")
    }
}
