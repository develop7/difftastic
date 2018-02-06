===
assignment expression
===

x = 3;

---

(program
  (assignment_expression
    (lhs (ambiguous_name (identifier)))
      (integer_literal (decimal_integer_literal))))

===
binary expression
===

a > b;
a == b;
a >= b;
a <= b;
a != b;
a && b;
a || b;
a & b;
a | b;
a ^ b;
a % b;
a << b;
a >> b;
a >>> b;

---

(program
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier)))
  (binary_expression (ambiguous_name (identifier)) (ambiguous_name (identifier))))


===
WIP binary expressions
===

a < b;
3 + 2;
3 - 2;
3 * 2;
9 / 3;

---

============================
if statements
============================

if (x)
  y;

---

(program
  (if_then_statement
      (ambiguous_name (identifier)) (ambiguous_name (identifier))))

============================
if statements with braces
============================

if (x) {
  y;
}

---

(program
  (if_then_statement
    (ambiguous_name (identifier)) (block (ambiguous_name (identifier)))))

============================
if statements with assignment without braces
============================

if (x = 3)
  y = 2;

---

(program
  (if_then_statement
    (assignment_expression (lhs (ambiguous_name (identifier))) (integer_literal (decimal_integer_literal)))
      (assignment_expression (lhs (ambiguous_name (identifier))) (integer_literal (decimal_integer_literal)))))

============================
if statements with assignment with braces
============================

if (x = 3) {
  y = 2;
}

---

(program
  (if_then_statement
    (assignment_expression (lhs (ambiguous_name (identifier))) (integer_literal (decimal_integer_literal)))
      (block
        (assignment_expression (lhs (ambiguous_name (identifier))) (integer_literal (decimal_integer_literal))))))

===
if statement without braces and one assignment in the then
===

if (x)
  y = 3;

---

(program
  (if_then_statement
    (ambiguous_name (identifier)) (assignment_expression (lhs (ambiguous_name (identifier))) (integer_literal (decimal_integer_literal)))))

===
if then else statement
===

if (x = 3) {
  y = 9;
} else {
  y = 0;
}

---

(program
  (if_then_else_statement
    (assignment_expression (lhs (ambiguous_name (identifier))) (integer_literal (decimal_integer_literal)))
     (block (assignment_expression (lhs (ambiguous_name (identifier))) (integer_literal (decimal_integer_literal))))
     (block (assignment_expression (lhs (ambiguous_name (identifier))) (integer_literal (decimal_integer_literal))))))

===
assignment
===
x = 1;

---

(program
  (assignment_expression
    (lhs (ambiguous_name (identifier))) (integer_literal (decimal_integer_literal))))
