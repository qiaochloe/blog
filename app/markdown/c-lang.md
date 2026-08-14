---
title: A Tour Through C
summary: Syntax • File Structure • Debugging
publishedAt: "2025-03-22"
tags:
  - "notes"
todo: "union, enums, arrow syntax for pointers, ternaries, goto"
---

This is a review of C syntax, file structure, and debugging—mainly for folks who are already familiar with computer systems and just need a refresher on syntax and ecosystem.

I originally put these notes together while sitting in on Brown's [Computer Systems](https://csci0300.github.io/) lectures. These notes pull a lot from the excellent materials on the course website, especially the TAs' C Primer ([1](https://csci0300.github.io/assets/c-primer1.html), [2](https://csci0300.github.io/assets/c-primer2.html), [3](https://csci0300.github.io/assets/c-primer3.html)) and [Lab 1](https://csci0300.github.io/assign/labs/lab1.html).

## Syntax

### Basic Syntax

**Comments** start with `//` or `/*`.

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

C is a statically typed language, which means that you need to specify the **type** of any variable. This is because the compiler needs to know how much memory to allocate for each variable. The size hierarchy of types is roughly as follows:

| Type      | Size                     | Value                       |
| --------- | ------------------------ | --------------------------- |
| `void`    | N/A                      | No value                    |
| `char`    | 1 byte                   | Character                   |
| `short`   | 2 bytes                  | Integer                     |
| `int`     | 4 bytes                  | Integer                     |
| `long`    | 8 bytes                  | Integer                     |
| `float`   | 4 bytes                  | Decimal                     |
| `double`  | 8 bytes                  | Decimal                     |
| `size_t`  | Implementation-dependent | Unsigned size of any object |
| `ssize_t` | Implementation-dependent | Signed size of any object   |

Note: you might also see imported types from `stdint.h`. For example, `uint8_t` represents an unsigned integer with exactly 8 bits (0-255).

**Characters** have type `char` and are denoted with single quotes.

```c
char c = 'a';
```

**Strings** are just arrays of characters! They have type `char*` or `char[]` and are denoted with double quotes. The reason why there are two types is covered in the [next section](#unsafe-memory-things).

```c
char* s1 = "Hello, World!";
char s2[] = "Hello, World!";
```

**Integers** have type `int` and are denoted as decimal numbers by default. You can also denote them as binary with the `0b` prefix or hexadecimal with the `0x` prefix.

```c
int n1 = 10;
int n2 = 0b1010;
int n3 = 0xA;
```

Numbers are implicitly _signed_. If you change them to `unsigned`, then the range of values that can be represented changes.

```c
// x can go from 0 to 4,294,967,295
unsigned int x;

// y and z can go from -2,147,483,648 to 2,147,483,647
int y;
signed int z;
```

**Functions** are declared with a return type, a name, and a list of parameters. Note that `void` is used to say that the function has no return value.

```c
int add(int a, int b) {
  return a + b;
}

void say_hello() {
  printf("Hello, World!\n");
}
```

**if-else** statements have a condition and a body

```c
int a = 0;
int b = 2;
if (a > b) {
  printf("A is greater than B\n");
} else {
  printf("B is greater than A\n");
}
```

`switch` statements are instantiated with a variable and multiple cases. Note that `break` is necessary to prevent fall-through.

```c
int n = 2;
switch (n) {
  case 1:
    printf("One\n");
    break;
  case 2:
    printf("Two\n");
    break;
  default:
    printf("Other\n");
```

`for` loops are instantiated with a loop constant, a loop condition, and a loop increment.

```c
for (int i = 1; i <= n; i++) {
    if (i % 15 == 0) {
        printf("FizzBuzz\n");
    } else if (i % 5 == 0) {
        printf("Buzz\n");
    } else if (i % 3 == 0) {
        printf("Fizz\n");
    } else {
        printf("%d\n", i);
    }
}
```

`while` loops are instantiated with a loop condition.

```c
int i = 0
while (i < 10) {
    printf("%d\n", i);
    i++;
}
```

**Structs** are typed and support destructuring.

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

### Pointers

C is a memory-unsafe language, which means that it is possible to access and manipulate memory directly. This is the biggest difference between C and other high-level languages.

**Pointers** are variables that store memory addresses. Here are a few rules:

1. The operator `&` returns the memory address of the variable. In a 64-bit system, a memory address is 64 bits, or 8 bytes. For example, the memory address of `n` below could be something like `0x16ce3afa8`.

   ```c
   int n = 10;   // 10
   &n            // Memory address of n
   ```

2. The type of a pointer is the type of the variable it points to, followed by a `*`.

   ```c
   int n = 10;       // 10
   int* n_ptr = &n;  // Memory address of n
   ```

3. The operand `*` dereferences a pointer to get the value at the memory address.

   ```c
   int n = 10;        // 10
   int* n_ptr = &n;   // Memory address of n
   *n_ptr += 1;
   printf("%d\n", n); // 11
   ```

When you increment a pointer, it moves forward by the size of the type it points to. This is called **pointer arithmetic**.

```c
int* n_ptr = (int*)0x16ce3afa8; // 0x16ce3afa8
n_ptr += 4;
printf("%p\n", n_ptr);          // 0x16ce3afb8 = 0x16ce3afa8 + 4 * 4
```

Note: In practice, no one types out memory addresses by hand. We almost always use `&` to get a handle on a memory address.

**Arrays** are pointers to the first element in the array. This works because arrays occupy contiguous blocks of memory, and each element in the array has a known type and size. You can do pointer arithmetic to get the memory of any element in the array.

```c
int arr[7] = {1, 2, 3, 4, 5, 6, 7};   // Memory address
int fifth = arr[4];                   // 5
int* fifth_ptr = arr + 4;             // Memory address
char fifth_again = *fifth_ptr;        // 5
```

As alluded to before, there are really two types of strings: string objects and string literals.

**String objects** are arrays of chars and have type `char[]`. They need to be manually null-terminated with the `\0` character.

Unlike string literals, string objects are stored in the stack section of memory and can be modified.

```c
char arr[7] = {'h', 'e', 'l', 'l', 'o', '!', '\0'}; // hello!\0
arr[0] = 'H';
*(arr + 5) = '?';
printf("%s\n", arr);                                // Hello?\0
```

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

**Function pointers** are pointers that point to functions.

```c
int add(int a, int b) {
  return a + b;
}
int (*addPtr)(int,int);
addPtr = &add;
int sum = (*addPtr)(2, 3); // 5
```

You can also use pointers in parameters or return values.

`addFactory` is a function that takes in an integer `n` and returns a function pointer of type `int (*)(int, int)`.

```c
int (*addFactory(int n))(int, int) {
  int (*addPtr)(int, int) = &add;
  return addPtr
}
```

### Heap

The compiler can **automatically** allocate memory on the **stack** using type information. However, if we don't know the size of the memory until runtime, the programmer needs to **dynamically** allocate memory on the **heap**.

We can allocate memory on the heap with `malloc` and `free` from `stdlib.h`. `malloc` allocates memory on the heap and returns a `void*` pointer to the address.

Every call to `malloc` should be paired with a call to `free` to avoid memory leaks.

```c
#include <stdlib.h>
char* s = (char *)malloc(10);
memcpy(s, "Goodbye", 8);
printf("%s\n", s);
free(s);
```

### Keywords

The `const` keyword guarantees that a variable will be immutable. This is reinforced by the compiler.

```c
const int n = 2;
n = 3; // Compilation error
```

The `static` keyword has multiple functions:

1. A `static` local variable will be allocated on the data section rather than the stack. This means that the variable will persist for the entire duration of the program.

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

2. A `static` global variable is not seen outside of the C file it is defined in.

3. A `static` function is also not seen outside of the C file it is defined in.

`#define` is a directive used to define macros.
Macros are replaced by their value by the preprocessor before the code is compiled.

```c
#define PI 3.14159
#define AREA(r) (PI * r * r)
```

## File Structure

### C Files

C files have a `.c` extension. A valid file name, for example, would be `program.c`.

Most C programs begin with a `main` function, which will be the first function executed. There are two accepted signatures for `main`:

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
int add(int a, int b) {
  return a + b;
}

int main() {
  return add(1, 2);
}
```

### C Projects

In a C project, **header files** are files with a `.h` extension. They are _technically_ the exact same as the **source files** (with the `.c` extension), but by convention, we put declarations in header files and definitions in source files.

For example, we may declare functions in `math.h`:

```c
// math.h
int add(int a, int b);
```

And then initialize them in `math.c`:

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

### C Standard Library

The **C standard library** provides extra functions in header files like `stdio.h` and `stdlib.h`. Because these header files are predefined, the `#include` syntax is slightly different:

```c
#include <stdio.h> // Pre-defined
#include "math.h"  // User-defined path
```

`stdlib.h` is a general library. It contains `malloc` and `free`, `abs` and `rand`, and other useful functions.

`stdio.h` is used for standard input and output.

- `scanf` reads from the console
- `printf` prints to the console

```c
#include <stdio.h>
char name[50];
scanf("%49s", name);
printf("Hello, %s!\n", name);
```

`string.h` is used for string manipulation.

- `strlen` gets the length of a string
- `strcpy` copies one string to another string
- `strcmp` compares two strings and returns `0` if they are equal
- `strcat` concatenates two strings

```c
char str1[20] = "Hello";              // str1 = Hello
char str2[] = "World";                // str2 = World
printf("%zu\n", strlen(str1));        // 5
strcpy(str1, "Hi \0");                // str1 = Hi
strcat(str1, str2);                   // str1 = Hi World
if (strcmp(str1, "Hi World") == 0) {  // true
  printf("Strings are equal!\n");
}
```

### Compilation

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

- `-fsanitize=address` enables the address sanitizers, which can detect memory bugs such as out-of-bounds access and dangling pointers. This flag also adds the leak sanitizer (`-fsanitize=leak`), which detects memory leaks.

- `-fsanitize=undefined` enables the undefined behavior sanitizer, which detects undefined behavior such as integer overflows and invalid type conversions.

- `-g` adds debugging information to the executable. This gives you more debugging information when you're using GDB or address sanitizers.

Warning: sanitizers can mess with GDB and the memory layout of the program.

**Optimization**

- `-O0` disables optimization. This is the default setting.

- `-01` to `-O3` enables optimizations, making your code run faster.

## Debugging

### `printf` debugging

`printf` debugging is useful when the code compiles but produces unexpected results.

To print variables to the console, use a _format specifier_ at the place where you want the variable to be. Then pass the variable as an additional argument to `printf`. They will replace the format specifiers in the string.

Format specifiers include:

- `%d` for decimal (base 10) integers
- `%x` for hexadecimal (base 16) integers
- `%ld` for `long`
- `%zu` for `size_t`
- `%p` for pointers or memory addresses
- `%s` for strings
- `%c` for ASCII characters

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

   But to be honest, GDB is not the best for quick, iterative work. Every time you change your program, you have to recompile, run GDB, and then reenter your commands.

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

## Algorithms

Bitwise operations:

```c
n & 1; // mod 2
n << 1; // multiply by 2
n >> 1; // divide by 2
```

Use **bitmasks** if you only want certain bits of a number. For example, we can calculate mod 16 by getting the 4 bits of the integer, or bit-masking every bit before it.

```c
n & 0b0000'0000'0000'0000'0000'0000'0000'1111
n & 0xf
```

## Miscellaneous Problems

Single number:

Every element appears twice except for one. Find that single one.

```c
int singleNumber(int* nums, int numsSize) {
    int output = 0;
    for (size_t i = 0; i < numsSize; i++) {
        output ^= nums[i];
    }
    return output;
}
```

Power of Two:

```c
bool isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}
```

Gray code:

```c
int* grayCode(int n, int* returnSize) {
    int numElems = (1<<n);
    int *ret = (int*)malloc(sizeof(int) * numElems);

    for (int i = 0; i < numElems; i++) {
        ret[i] = i ^ (i>>1);
    }
    *returnSize = numElems;
    return ret;
}
```

Reversing a linked list:

```c
typedef struct {
  int data;
  struct Node* next;
} Node;

ListNode* reverseList(ListNode* head) {
  ListNode* currNode = head;
  ListNode* nextNode = NULL;
  ListNode* prevNode = NULL;

  while (currNode) {
    nextNode = currNode->next;
    currNode->next = prevNode;
    prevNode = currNode;
    currNode = nextNode;
  }

  return prevNode;
}
```

Valid Anagram:

```c
bool isAnagram(char* s, char* t) {
    if (strlen(s) != strlen(t)) {
        return 0;
    }

    int count[26] = {0};

    for (int i = 0; s[i] != '\0'; i++) {
        count[s[i] - 'a']++;
        count[t[i] - 'a']--;
    }

    for (int i = 0; i < 26; i++) {
        if (count[i] != 0) {
            return 0;
        }
    }
    return 1;
}
```
