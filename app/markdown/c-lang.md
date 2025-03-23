---
title: C Lang
summary: A review of C syntax, file structure, and debugging.
publishedAt: "2025-03-22"
tags:
  - "technical"
---

This is a review of C syntax, file structure, and debugging—mainly for folks who are already familiar with computer systems and just need a refresher on C syntax and the C ecosystem.

I originally put these notes together while sitting in on [CSCI 0300](https://csci0300.github.io/) lectures. I had become a TA after not using C for about six months and was worried I’d gotten a bit rusty. These notes pull a lot from the excellent materials on the course website, especially the CS 0300 TAs' C Primer ([1](https://csci0300.github.io/assets/c-primer1.html), [2](https://csci0300.github.io/assets/c-primer2.html), [3](https://csci0300.github.io/assets/c-primer3.html)) and [Lab 1](https://csci0300.github.io/assign/labs/lab1.html).

I've included my own thoughts about how to go about debugging.

## Table of Contents

1. [Syntax](#syntax)

   1. [Basic syntax](#basic-syntax) covers comments, variables, characters, strings, numbers, types, functions, structs, and other syntaxes.
   2. [Unsafe memory things](#unsafe-memory-things) covers pointers, arrays, strings, and memory allocation. This is a _very_ quick syntactic review and does not cover the memory layout.
   3. [Miscellaneous](#miscellaneous) covers `const`, `static`, and `#define`.

2. [File structure](#file-structure)

   1. [C files](#c-files) covers how to compile and execute the most basic C file.
   2. [C projects](#c-projects) covers source files, header files, the standard library, and global variables.
   3. [Compiling C programs](#compiling-c-programs) covers compiling with warnings, sanitizers, and optimizations.

3. [Debugging](#debugging)
   1. [`printf` debugging](#object-object-debugging) covers how to use `printf` to debug your code.
   2. [GDB](#gdb) covers how to use the GNU debugger.
   3. [Inspecting file contents](#inspecting-file-contents) covers `xxd` and `diff`.

## Syntax

### Basic syntax

There are both single-line and multi-line **comments**.

```c
// This is a single line comment.

/*
 * This is
 * a multi-line
 * comment
 */
```

**Variables** can be declared, initialized, and mutated.

```c
int n;   // Declaration
n = 10;  // Initialization
n = 100; // Mutation
```

**Characters** have type `char` and are denoted with single quotes. **Strings** are just arrays of characters! They have type `char*` or `char[]` and are denoted with double quotes. The reason why there are two types is slightly more complicated; see [unsafe memory things](#unsafe-memory-things).

```c
char c = 'a';
char* s1 = "Hello, World!";
char s2[] = "Hello, World!";
```

C is a statically typed language, which means that you need to specify the **type** of any variable. This is because the compiler needs to know how much memory to allocate for each variable. The size hierarchy of types is roughly as follows:

| Type      | Size                     | Value                       |
| --------- | ------------------------ | --------------------------- |
| `void`    | N/A                      | No value                    |
| `char`    | 1 byte                   | Character                   |
| `short`   | 2 bytes                  | Whole number                |
| `int`     | 4 bytes                  | Whole number                |
| `long`    | 8 bytes                  | Whole number                |
| `float`   | 4 bytes                  | Decimal number              |
| `double`  | 8 bytes                  | Decimal number              |
| `size_t`  | Implementation-dependent | Unsigned size of any object |
| `ssize_t` | Implementation-dependent | Signed size of any object   |

**Functions** are declared with a return type, a name, and a list of parameters.
Notice that `void` is used to say that the function has no return value.

```c
int add(int a, int b) { return a + b; }
void print_hello_world() { printf("Hello, World!\n"); }
```

**Structs** are typed and support distructuring.

```c
#include <math.h>

struct point {
  int x;
  int y;
};

int distance(struct point p1, struct point p2) {
  return sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

int test_distance() {
  struct point p1 = {0, 0};
  struct point p2 = {1, 1};
  return distance(p1, p2) == sqrt(2);
}
```

Conditionals, boolean operators, and `for` and `while` loops are very similar to those in other languages.

### Unsafe memory things

C is a memory-unsafe language. This means that it is possible to access and manipulate memory directly. This is the biggest difference between C and other high-level languages. This section only covers some _syntactic constructions_ and not conceptual topics like **memory representation**, **alignment**, and **collection rules**.

**Pointers** are variables that store memory addresses.
Adding `*` to a _type_ makes it a pointer to that type.
Adding `*` to a variable gives you the value at that memory address.
Adding `&` to a variable gives you the memory address of that variable.

```c
// An int with a value of 10
int n = 10;

// An int pointer whose value is the memory address of n
// Like 0x16ce3afa8 or something
int* n_ptr = &n;

// Dereferencing the pointer and adding 1 to the value 10
*n_ptr += 1;
```

**Arrays** are pointers to the first element in the array. This works because arrays occupy contiguous blocks of memory, and each element in the array has a known type and size. You can do pointer arithmetic to get the memory of any element in the array.

```c
char arr[7] = {'h', 'e', 'l', 'l', 'o', '!', '\0'};
char fifth = arr[4];           // o
char* fifth_ptr = arr + 4;     // 0x16ce3afa8 or something
char fifth_again = *fifth_ptr; // o
```

As alluded to before, there are really two types of strings. **String objects** are arrays of chars and have type `char[]`. They are stored in the stack section of memory, which means that they are modifiable.

**String literals** are sequences of chars and have type `char*`. _Unlike string objects, string literals are not mutable._ The compiler automatically adds the terminating null characters `\0` to string literals.

```c
// A pointer to a string literal
char* a = "Hello, World!";

// A string object initialized by a string literal
char b[] = "Hello, World!";

// Undefined behavior because this is a string literal
a[0] = 'h';

// Valid because this is a string object
b[0] = 'h';
```

The compiler can **automatically** allocate memory on the **stack** using type information. However, if we don't know the size of the memory until runtime, the programmer needs to **dynamically** allocate memory on the **heap**.

We can allocate memory on the heap with `malloc` and `free` from `stdlib.h`.
Every call to `malloc` should be paired with a call to `free` to avoid memory leaks.

```c
#include <stdlib.h>
char* s = (char*)malloc(10); // Malloc returns a void*, so we need to type cast
free(s);
```

### Miscellaneous

This section will be difficult to really understand without a background in computer systems, such as knowing the memory layout.

Variables can be immutable with the `const` keyword.

```c
const int n;
```

And it can allocated on static memory with the `static` keyword.

```c
int g() {
  static int n = 0;
  n++;
  return n;
}

int main() {
  // Prints out 1 2 3 4 5
  for (int i = 0; i < 5; i++) {
    printf("%d ", g());
  }
}
```

**Numbers** are implicitly _signed_. If you change them to _unsigned_, then the range of values that can be represented changes.

```c
// x can go from 0 to 4,294,967,295
unsigned int x;

// y and z can go from -2,147,483,648 to 2,147,483,648
int y;
signed int z;
```

`#define` is a directive used to define macros.
Macros are replaced by their value by the preprocessor before the code is compiled.
They are not variables, and they are not allocated memory in the program.

```c
#define PI 3.14159
#define AREA(r) (PI * r * r)
```

## File structure

### C files

C files have a `.c` extension. A valid file name, for example, would be `program.c`.

Every C program must have a `main` function. The `main` function is the first function that is executed. There are two accepted signatures for `main`:

```c
// No command-line arguments
int main() {
  ...
}

// `argc` is the number of elements in `argv`
// `argv` contains the name of the program and any command-line arguments
int main(int argc, char* argv[]) {
  ...
}
```

The C compiler works in one pass, which means that functions must be declared before they are used.

```c
int add(int a, int b) { return a + b; }
int main() { return add(1, 2); }
```

### C Projects

In a C project, **header files** are files with a `.h` extension. They are _technically_ the exact same as the **source files** (with the `.c` extension), but by convention, we put declarations in header files and definitions in source files.

We also tend to declare functions, constants, and macros that are _shared_ across multiple files in a header file. For example, we can declare functions like this:

```c
// math.h
int add(int a, int b);
```

And then initialize them like this:

```c
// math.c
int add(int a, int b) {
  return a + b;
}
```

And then `#include` the header file in our C program to use the function.

```c
// program.c
#include "math.h"
int main() {
  return add(1, 2);
}
```

The **C standard library** provides extra functions in header files like `stdio.h` and `stdlib.h`. We can also use functions from the C standard library with the `#include` preprocessor too!

There are two different syntaxes, depending whether the header file is pre-defined or user-defined.

```c
#include <stdio.h> // Pre-defined in the system, like standard libraries
#include "math.h"  // User-defined. Should be the path to the header file
```

Here is a brief tour of some common libraries:

- `stdlib.h` is a general library. It contains `malloc` and `free`, `abs` and `rand`, and other useful functions.
- `stdio.h` is for standard input and output. It contains `printf` to print to the console and `fopen` to open a file.
- `string.h` is for manipulating strings. It contains `memcpy`, `strcmp`, and `strlen`.

### Compiling C programs

GCC, the GNU Compiler Collection, is the most common C compiler. To compile a single C program into an executable, do:

```bash
gcc program.c -o program
./program
```

The first input is the source file, and the `-o` flag specifies the name of the output executable. We can then run the program with `./program`. If you don't specify the `-o` flag, the default name of the executable is `a.out`. You can run that by typing `./a.out`.

In general, the structure of compiling a program is as follows:

```bash
gcc <flags> <source-files> -o <executable-name>
```

The gcc compiler accepts a lot of flags to customize the compilation process. Here are some common ones:

**Warnings**

- `-Wall` enables all warnings. Some examples include:

  1. Uninitialized and unused variables
  2. Incorrect return types
  3. Invalid type comparisons.

- `-Werror` forces the compiler to treat all warnings as errors, which means that it won't compile until you fix them.

- `-Wextra` adds a few more warnings, such as:
  1. Assert statements that are always true
  2. Unused function parameters
  3. Empty if/else statements

**Sanitizers**

**Warning:** sanitizers can mess with GDB and the memory layout of the program.

- `-fsanitize=address` enables the address sanitizers, which can detect memory bugs such as out-of-bounds access and dangling pointers. This flag also adds the leak sanitizer (`-fsanitize=leak`), which detects memory leaks.

- `-fsanitize=undefined` enables the undefined behavior sanitizer, which detects undefined behavior such as integer overflows and invalid type conversions.

- `-g` adds debugging information to the executable. This gives you more debugging information when you're using GDB or address sanitizers.

**Optimization**

- `-O0` disables optimization. This is the default setting.

- `-01` to `-O3` enables optimizations, making your code run faster.

### Debugging

### `printf` debugging

`printf` debugging is useful when the code compiles but produces unexpected results.

To print variables to the console, use a _format specifier_ at the place where you want the variable to be.
Then pass the variable as an additional argument to `printf`. They will replace the format specifiers in the string.

Here are the different format specifiers:

- `%d` for decimal (base 10) integers
- `%x` for hexadecimal (base 16) integers
- `%ld` for longs
- `%c` for ASCII characters
- `%p` for pointers or memory addresses
- `%s` for strings

```c
#include <stdio.h>

int main() {
  int a = 99;
  char b[] = "Hello, World!";
  printf("%d is also known as %c and %x\n", a, a, a);
  printf("We also have %s at memory %p\n", b, b);
}

// Output:
// 99 is also known as c and 63
// We also have Hello, World! at memory 0x16ce3afa8
```

### GDB

GDB, the GNU debugger, is a command-line tool for walking through execution of a C program.

Here is the shortlist of commands:

```
gdb <executable>
[b]reak <breakpoint>
[d]elete <breakpoint number>
[r]un <args>
[c]ontinue
[n]ext
[s]tep
[b]ack[t]race
[p]rint <expression>
```

You can also do `info` on `break`points, `threads`, and `frame`s.

**Common problems:**

1. GDB isn't working.

   Sanitizers should not be used on binaries attached to GDB. Make sure to compile the program without sanitizers, or you might get some unexpected errors.

2. The screen looks wrong.

   Try `ctrl-l` to refresh the screen. Changing the terminal window size also helps for me.

3. I don't want to retype the commands every time.

   One thing you can do is create a gdbinit file to automatically execute GDB commands. But honestly, in most cases like that, `printf` debugging is better.

4. I don't know when to use GDB and when to use print statements.

   I turn to GDB when I have no clue what the code is doing, or where it is segmentation-faulting, and I just want to get an idea about the execution. This is very helpful in TA hours, since I'm usually seeing the students' code for the first time.

   I think you should know enough about GDB to feel comfortable reaching for it when you have no idea what to do. **GDB is one of the best ways to get unstuck.**

   To be honest though, GDB is not the best for quick, iterative work. Every time you change your program, you have to recompile, run GDB, and then reenter your commands. Even with a gdbinit file, this can be a pain.

   If you have a clear idea of where the bug is, `printf` debugging is better. You can quickly change something in your code, recompile and execute, and see the results.

   TLDR: Use GDB when you have no idea what is going on, and use `printf` debugging when you have a good idea of where the bug is.

5. I'm still not convinced that I should use GDB.

   ["Give me 15 minutes & I'll change your view of GDB,"](https://youtu.be/PorfLSr3DDI?si=jZHDFOwtCgVfSjBA) a presentation by Greg Law.

6. I want to learn more about GDB!

   ["Cool stuff about GDB you didn't know,"](https://youtu.be/IqH3Mh-OI-8?si=O4rlNCia_5ZzrJlO) a presentation by Greg Law.

### Inspecting file contents

To check the contents of a binary file, use a _hexdump_ tool like `xxd`. This will "dump" the contents of teh file in hexadecimal format.

```bash
xxd <file>
```

To compare the contents of two text files, use the `diff` tool.

```bash
diff -u <file1> <file2>
```

`diff` does not work well with binary files. But you can combine it with `xxd` like so:

```bash
xxd <file1> > file1.hex
xxd <file2> > file2.hex
diff -u file1.hex file2.hex
```
