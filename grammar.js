const NEWLINE = /\r?\n/;

module.exports = grammar({
  name: "gleam",
  extras: ($) => [";", NEWLINE, /\s/],
  rules: {
    /* General rules */
    source_file: ($) =>
      optional(
        seq(
          series_of(choice($.target_group, $._statement), NEWLINE),
          optional(NEWLINE)
        )
      ),
    _statement: ($) =>
      choice(
        $.import,
        $.public_constant,
        $.constant,
        $.external_type
        /* $.external_function, */
        /* $._public_extenal_type_or_function, */
        /* $.function, */
        /* $.public_function, */
        /* $.type, */
        /* $.public_opaque_type, */
        /* $.public_type */
      ),

    /* Target groups */
    target_group: ($) =>
      seq(
        "if",
        field("target", $.target),
        "{",
        optional(seq(series_of($._statement, NEWLINE), optional(NEWLINE))),
        "}"
      ),
    target: ($) => choice("erlang", "javascript"),

    /* Import statements */
    import: ($) =>
      seq(
        "import",
        field("module", $.module),
        optional(
          seq(
            ".",
            "{",
            $.unqualified_import,
            repeat(seq(",", $.unqualified_import)),
            "}"
          )
        ),
        optional(seq("as", field("alias", $.alias)))
      ),
    module: ($) => seq($._name, repeat(seq("/", $._name))),
    unqualified_import: ($) =>
      choice(
        seq(
          $._name,
          optional(seq("as", field("alias", alias($._name, $.alias))))
        ),
        seq(
          $._upname,
          optional(seq("as", field("alias", alias($._upname, $.alias))))
        )
      ),
    alias: ($) => $._name,

    /* Constant statements */
    public_constant: ($) => seq("pub", $._constant),
    constant: ($) => $._constant,
    _constant: ($) =>
      seq(
        "const",
        field("name", alias($._name, $.identifier)),
        optional($._constant_type_annotation),
        "=",
        field("value", $._constant_value)
      ),
    _constant_value: ($) =>
      choice(
        $.string,
        $.float,
        $.integer,
        alias($._constant_tuple, $.tuple),
        alias($._constant_list, $.list),
        alias($._constant_bit_string, $.bit_string),
        alias($._constant_record, $.record),
        alias($._constant_remote_record, $.remote_record)
      ),
    _constant_tuple: ($) =>
      seq("#", "(", series_of($._constant_value, ","), ")"),
    _constant_list: ($) => seq("[", series_of($._constant_value, ","), "]"),
    _constant_bit_string: ($) =>
      seq(
        "<<",
        optional(
          series_of(
            alias($._constant_bit_string_segment, $.bit_string_segment),
            ","
          )
        ),
        ">>"
      ),
    _constant_bit_string_segment: ($) =>
      seq(
        field("value", $._constant_value),
        optional(
          field(
            "options",
            seq(
              ":",
              alias(
                $._constant_bit_string_segment_options,
                $.bit_string_segment_options
              )
            )
          )
        )
      ),
    // This is not an actual node in the Gleam AST. It only exists to allow me
    // to group the segment options together into their own list.
    _constant_bit_string_segment_options: ($) =>
      series_of($._constant_bit_string_segment_option, "-"),
    _constant_bit_string_segment_option: ($) =>
      choice(
        $._constant_bit_string_named_segment_option,
        alias($.integer, $.constant_int)
      ),
    _constant_bit_string_named_segment_option: ($) =>
      choice(
        $._bit_string_segment_option_unit,
        $._constant_bit_string_segment_option_size,
        $._bit_string_segment_option_literal
      ),
    _constant_bit_string_segment_option_size: ($) =>
      seq("size", "(", alias($.integer, $.bit_string_segment_option_size), ")"),
    _constant_record: ($) =>
      seq(
        $._upname,
        optional(
          seq(
            "(",
            optional(
              series_of(alias($._constant_record_arg, $.record_arg), ",")
            ),
            ")"
          )
        )
      ),
    _constant_record_arg: ($) =>
      seq($._name, optional(seq(":", $._constant_value))),
    _constant_remote_record: ($) => seq($._name, ".", $._constant_record),

    /* Special constant types */
    _constant_type_annotation: ($) => seq(":", field("type", $._constant_type)),
    _constant_type: ($) =>
      choice(
        $.type_hole,
        alias($.constant_tuple_type, $.tuple_type),
        alias($.constant_type_constructor, $.type_constructor),
        alias($.constant_remote_type_constructor, $.remote_type_constructor)
      ),
    constant_tuple_type: ($) =>
      seq("#", "(", optional(series_of($._constant_type, ",")), ")"),
    constant_type_constructor: ($) => $._constant_type_constructor,
    constant_remote_type_constructor: ($) =>
      seq($._name, ".", $._constant_type_constructor),
    _constant_type_constructor: ($) =>
      seq($._upname, optional(seq("(", series_of($._constant_type, ","), ")"))),

    /* External types */
    external_type: ($) =>
      seq(
        "external",
        "type",
        field("name", alias($._upname, $.type_name)),
        optional(
          field("arguments", seq("(", optional($.external_type_arguments), ")"))
        )
      ),
    external_type_arguments: ($) =>
      series_of(alias($._name, $.external_type_argument), ","),

    /* Literals */
    _literal: ($) =>
      choice(
        $.string,
        $.float,
        $.integer,
        $.tuple,
        $.list
        // $.bit_string,
        // $.record,
        // $.remote_record
      ),
    string: ($) => /\"(?:\\[efnrt\"\\]|[^\"])*\"/,
    float: ($) => /-?[0-9_]+\.[0-9_]+/,
    integer: ($) => /-?[0-9_]+/,
    tuple: ($) => seq("#", "(", series_of($._literal, ","), ")"),
    list: ($) => seq("[", series_of($._literal, ","), "]"),
    bit_string: ($) =>
      seq("<<", optional(series_of($.bit_string_segment, ",")), ">>"),
    bit_string_segment: ($) =>
      seq(
        $._literal,
        optional(seq(":", series_of($._bit_string_segment_option, "-")))
      ),
    _bit_string_segment_option: ($) =>
      choice($.bit_string_named_segment_option, alias($.integer, $.size)),
    bit_string_named_segment_option: ($) =>
      choice(
        $._bit_string_segment_option_unit,
        $._bit_string_segment_option_size,
        $._bit_string_segment_option_literal
      ),
    _bit_string_segment_option_unit: ($) =>
      seq("unit", "(", alias($.integer, $.bit_string_segment_option_unit), ")"),
    _bit_string_segment_option_size: ($) => seq("size", "(", $.integer, ")"),
    _bit_string_segment_option_literal: ($) =>
      choice(
        alias("binary", $.bit_string_segment_option_binary),
        alias("bytes", $.bit_string_segment_option_binary),
        alias("int", $.bit_string_segment_option_int),
        alias("float", $.bit_string_segment_option_float),
        alias("bit_string", $.bit_string_segment_option_bit_string),
        alias("bits", $.bit_string_segment_option_bit_string),
        alias("utf8", $.bit_string_segment_option_utf8),
        alias("utf16", $.bit_string_segment_option_utf16),
        alias("utf32", $.bit_string_segment_option_utf32),
        alias("utf8_codepoint", $.bit_string_segment_option_utf8_codepoint),
        alias("utf16_codepoint", $.bit_string_segment_option_utf16_codepoint),
        alias("utf32_codepoint", $.bit_string_segment_option_utf32_codepoint),
        alias("signed", $.bit_string_segment_option_signed),
        alias("unsigned", $.bit_string_segment_option_unsigned),
        alias("big", $.bit_string_segment_option_big),
        alias("little", $.bit_string_segment_option_little),
        alias("native", $.bit_string_segment_option_native)
      ),

    /* Types */
    type_var: ($) => $._name,
    type_hole: ($) => $._discard_name,

    /* Reused types from the Gleam lexer */
    _discard_name: ($) => /_[_0-9a-z]*/,
    _name: ($) => /[_a-z][_0-9a-z]*/,
    _upname: ($) => /[A-Z][0-9a-zA-Z]*/,
  },
});

// Shamelessly stolen "sep1" from tree-sitter-elixir, renamed to match a similar
// function in the Gleam parser.
// https://github.com/elixir-lang/tree-sitter-elixir/blob/de3ec57591aebf451e710fc9c984cf601258baf5/grammar.js#L817-L819
function series_of(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
