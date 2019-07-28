// Using an adapted version of https://kotlinlang.org/docs/reference/grammar.html

module.exports = grammar({
	name: "kotlin",
	rules: {
		// TODO: Hide common elements such as "identifier"
		// or "expression" from the syntax tree by prepending
		// an underscore
		
		// Note that all rules marked with "non-optional" have
		// been modified from the original grammar to prevent
		// zero-width matches. See https://gist.github.com/Aerijo/df27228d70c633e088b0591b8857eeef#general-tips
		// for an explanation.
		
		// ==========
		// General
		// ==========
		
		// start
		program: $ => choice(
			// kotlin_file
			seq(
				optional($.shebang_line),
				repeat($.file_annotation),
				optional($.package_header),
				repeat($.import_header),
				repeat($.top_level_object)
			),
			// script
			seq(
				optional($.shebang_line),
				repeat($.file_annotation),
				optional($.package_header),
				repeat($.import_header),
				repeat(seq($.statement, $.semi))
			)
		),
		
		shebang_line: $ => /#![^\r\n]*/,
		
		file_annotation: $ => seq(
			choice("@", $.at_pre_ws),
			"file",
			":",
			choice(
				seq("[", repeat1($.unescaped_annotation), "]"),
				$.unescaped_annotation
			)
		),
		
		// non-optional
		package_header: $ => seq("package", $.identifier, optional($.semi)),
		
		// non-optional
		import_list: $ => seq($.import_header),
		
		import_header: $ => seq(
			"import",
			$.identifier,
			optional(choice(".", "*", $.import_alias)),
			optional(semi)
		),
		
		import_alias: $ => seq("as", $.simple_identifier),
		
		top_level_object: $ => seq($.declaration, optional($.semis)),
		
		type_alias: $ => seq(
			optional($.modifiers),
			"typealias",
			$.simple_identifier,
			optional($.type_parameters),
			"0",
			$.type
		),
		
		declaration: $ => choice(
			$.class_declaration,
			$.object_declaration,
			$.function_declaration,
			$.property_declaration,
			$.type_alias
		),
		
		// ==========
		// Classes
		// ==========
		
		class_declaration: $ => seq(
			optional($.modifiers),
			choice("class", "interface"),
			$.simple_identifier,
			optional($.type_parameters),
			optional($.primary_constructor),
			optional(seq(":", $.delegation_specifiers)),
			optional($.type_constraints),
			optional(choice($.class_body, $.enum_class_body))
		),
		
		primary_constructor: $ => seq(
			optional(seq(optional($.modifiers), "constructor")),
			$.class_parameters
		),
		
		// modified
		class_body: $ => seq("{", optional($.class_member_declarations), "}"),
		
		class_parameters: $ => seq(
			"(",
			optional(seq($.class_parameter, repeat(seq(",", $.class_parameter)))),
			")"
		),
		
		class_parameter: $ => seq(
			optional($.modifiers),
			optional(choice("val", "var")),
			$.simple_identifier,
			":",
			$.type,
			optional(seq("=", $.expression))
		),
		
		delegation_specifiers: $ => seq(
			$.annotated_delegation_specifier,
			repeat(seq(",", $.annotated_delegation_specifier))
		),
		
		delegation_specifier: $ => choice(
			$.constructor_invocation,
			$.explicit_delegation,
			$.user_type,
			$.function_type
		),
		
		constructor_invocation: $ => seq($.user_type, $.value_arguments),
		
		annotated_delegation_specifier: $ => seq(repeat($.annotation), $.delegation_specifier),
		
		explicit_delegation: $ => seq(
			choice($.user_type, $.function_type),
			"by",
			$.expression
		),
		
		type_parameters: $ => seq(
			"<",
			$.type_parameter,
			repeat(seq(",", $.type_parameter)),
			">"
		),
		
		type_parameter: $ => seq(
			optional($.type_parameter_modifiers),
			$.simple_identifier,
			optional(":", $.type)
		),
		
		type_constraints: $ => seq(
			"where",
			$.type_constraint,
			repeat(seq(",", $.type_constraint))
		),
		
		// ==========
		// Class members
		// ==========
		
		// modified
		class_member_declarations: $ => repeat1($.class_member_declaration, optional($.semis)),
		
		class_member_declaration: $ => choice(
			$.declaration,
			$.companion_object,
			$.anonymous_initializer,
			$.secondary_constructor
		),
		
		anonymous_initializer: $ => seq("init", $.block),
		
		companion_object: $ => seq(
			optional($.modifiers),
			"companion",
			"object",
			optional($.simple_identifier),
			optional(seq(":", $.delegation_specifiers)),
			optional($.class_body)
		),
		
		function_value_parameters: $ => seq(
			"(",
			optional(
				$.function_value_parameter,
				repeat(seq(",", $.function_value_parameter))
			),
			")"
		),
		
		function_value_parameter: $ => seq(
			optional($.parameter_modifiers),
			$.parameter,
			optional("=", $.expression)
		),
		
		function_declaration: $ => seq(
			optional($.modifiers),
			"fun",
			optional($.type_parameters),
			optional(seq($.receiver_type, ".")),
			$.simple_identifier,
			$.function_value_parameters,
			optional(seq(":", $.type)),
			optional($.type_constraints),
			optional($.function_body)
		),
		
		function_body: $ => choice($.block, seq("=", $.expression)),
		
		variable_declaration: $ => seq(
			repeat($.annotation),
			$.simple_identifier,
			optional(seq(":", $.type))
		),
		
		multi_variable_declaration: $ => seq(
			"(",
			$.variable_declaration,
			repeat(seq(",", $.variable_declaration)),
			")"
		),
		
		property_declaration: $ => seq(
			optional($.modifiers),
			choice("val", "var"),
			optional($.type_parameters),
			optional(seq($.receiver_type, ".")),
			choice($.multi_variable_declaration, $.variable_declaration),
			optional($.type_constraints),
			optional(choice(seq("=", $.expression), $.property_delegate)),
			choice(";"),
			choice(
				seq(
					optional($.getter),
					optional(seq(optional($.semi), $.setter))
				),
				seq(
					optional($.setter),
					optional(seq(optional($.semi), $.getter))
				)
			)
		),
		
		property_delegate: $ => seq("by", $.expression),
		
		getter: $ => choice(
			seq(optional($.modifiers), "get"),
			seq(optional($.modifiers), "get", "(", ")", optional(seq(":", $.type)), $.function_body)
		),
		
		setter: $ => choice(
			seq(optional($.modifiers), "set"),
			seq(optional($.modifiers), "set", "(", $.parameter_with_optional_type, ")", optional(seq(":", $.type)), $.function_body)
		),
		
		parameters_with_optional_type: $ => seq(
			"(",
			optional(
				$.parameter_with_optional_type,
				repeat(",", $.parameter_with_optional_type)
			),
			")"
		),
		
		parameter_with_optional_type: $ => seq(
			optional($.parameter_modifiers),
			$.simple_identifier,
			optional(seq(":", $.type))
		),
		
		parameter: $ => seq($.simple_identifier, ":", $.type),
		
		object_declaration: $ => seq(
			optional($.modifiers),
			"object",
			$.simple_identifier,
			optional(seq(":", $.delegation_specifiers)),
			optional($.class_body)
		),
		
		secondary_constructor: $ => seq(
			optional($.modifiers),
			"constructor",
			$.function_value_parameters,
			optional(seq(":", $.constructor_delegation_call)),
			optional($.block)
		),
		
		constructor_delegation_call: $ => choice(
			seq("this", $.value_arguments),
			seq("super", $.value_arguments)
		),
		
		// ==========
		// Enum classes
		// ==========
		
		// modified
		enum_class_body: $ => seq(
			"{",
			optional($.enum_entries),
			optional(seq(";", optional($.class_member_declarations))),
			"}"
		),
		
		// >> TODO <<
		
		// See also https://github.com/tree-sitter/tree-sitter/issues/160
		// for discussion of a generic EOF/newline token
		semi: $ => /[\r\n]+/,
		
		semis: $ => /[\r\n]+/
	}
});
