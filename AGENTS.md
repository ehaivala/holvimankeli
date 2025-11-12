# Holvimankeli

## Project overview

This project is a client side React application without any kind of backend. The concept of the
project is simple:

1. Read an user provided .xlsx file
2. Process and format the data
3. Output the result as .csv

## Development Guidelines

### Dependency Management

- Always install new dependencies using the `@latest` tag (I.e., `npm install package@latest`).
- Never pin or manually select a specific version.

### Test-Driven Development (TDD)

- **Follow TDD principles for all new features:**
  1. Write a failing test that defines the desired improvement or new function.
  2. Write the minimal amount of code required to make the test pass.
  3. Refactor the new code to acceptable standards.
  4. Repeat this process for each new unit of functionality.

### Testing Practices

- Keep code easy to unit test using [Vitest](https://vitest.dev/).
- Write small, focused units of logic that are easy to cover with unit tests.
- Commit new code only after relevant tests pass.

### React Component Style

- Use **function components** for all new React code.
- **Avoid class components** - do not introduce them into the codebase.
- Prefer React hooks and idiomatic function component patterns.

### Code Structure

- Use the **container-component pattern**:
  - **Containers**: Hold data fetching, state management, and logic.
  - **Presentational (visual) components**: Receive data and callbacks via props, and focus solely on rendering UI.
- Keep presentational components simple and stateless when possible.

### TypeScript Conventions

- **Always use explicit types.** Avoid using `any`. Use interfaces, types, enums, and generics to
  describe the shape of your data.
- **Leverage type inference, but clarify when necessary.** Let TypeScript infer types where it is
  obvious, but annotate return types for functions and components to catch errors early.
- **Prefer interfaces for object shapes.** Use `interface` or `type` aliases for describing the
  props of components and structures of objects.
- **Prefer enums over string literals.** Use TypeScript `enum`s to represent a fixed set of values
  instead of string literals.
