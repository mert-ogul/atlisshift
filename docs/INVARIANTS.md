# Invariants

Invariants are properties that must hold true for code to be considered valid. AtlasShift automatically discovers and validates invariants before applying transformations.

## Types of Invariants

### Structural Invariants

Properties about the code structure:

- **File existence**: All referenced files must exist
- **Node connectivity**: Nodes should be properly connected
- **No orphans**: Minimal disconnected components

### Dependency Invariants

Properties about code dependencies:

- **No circular imports**: Import graphs must be acyclic
- **Valid references**: All imports must resolve
- **Consistent exports**: Exported symbols must be defined

### Semantic Invariants

Properties about code meaning:

- **Function usage**: Functions should be called (with exceptions)
- **Type consistency**: Types should be used correctly
- **Pattern adherence**: Code should follow expected patterns

## Invariant Mining

The `InvariantMiner` automatically discovers invariants by:

1. Analyzing graph structure
2. Detecting patterns
3. Inferring constraints

## Invariant Validation

Before applying transformations:

1. All invariants are checked
2. Error-level violations block transformations
3. Warning-level violations are reported

## Custom Invariants

You can define custom invariants:

```typescript
const customInvariant: Invariant = {
  id: 'my-invariant',
  type: 'semantic',
  description: 'My custom rule',
  check: (graph: CodeGraph) => {
    // Your validation logic
    return true;
  },
  severity: 'error',
};
```

## Future Work

- Machine learning for invariant discovery
- Domain-specific invariant libraries
- Invariant evolution tracking
