# Recipes

Recipes define architecture-level transformation patterns for AtlasShift.

## What is a Recipe?

A recipe is a reusable pattern that describes how to transform a codebase. It consists of:

- **Identification logic**: How to find code patterns to transform
- **Transformation steps**: What changes to make
- **Validation rules**: How to ensure correctness

## Example Recipe

The example recipe (`example-extract-utils`) demonstrates extracting utility functions into a separate module.

## Creating a Recipe

```typescript
import type { Recipe, CodeGraph, MigrationPlan } from '@atlasshift/shared';

export function createMyRecipe(): Recipe {
  return {
    id: 'my-recipe',
    name: 'My Recipe',
    description: 'Description of what this recipe does',
    version: '1.0.0',
    plan: (graph: CodeGraph): MigrationPlan => {
      // Your planning logic here
    },
  };
}
```

## Recipe Best Practices

1. **Be specific**: Target clear, identifiable patterns
2. **Validate early**: Check prerequisites before planning
3. **Preserve invariants**: Ensure transformations don't break code structure
4. **Document assumptions**: Clearly state what the recipe expects

## Future Recipes

- Extract components to separate files
- Migrate to new framework patterns
- Refactor module boundaries
- Update dependency patterns
