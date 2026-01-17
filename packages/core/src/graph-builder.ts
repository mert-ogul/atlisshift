import type {
  FileNode,
  CodeGraph,
  GraphNode,
  GraphEdge,
} from '@atlasshift/shared';

/**
 * Builds a code graph from file nodes
 */
export class GraphBuilder {
  private nodes: GraphNode[] = [];
  private edges: GraphEdge[] = [];

  /**
   * Builds a code graph from file nodes
   */
  build(files: FileNode[]): CodeGraph {
    this.nodes = [];
    this.edges = [];

    for (const file of files) {
      this.addFileNode(file);
      this.analyzeFile(file, files);
    }

    return {
      nodes: this.nodes,
      edges: this.edges,
    };
  }

  private addFileNode(file: FileNode): void {
    const nodeId = this.getFileNodeId(file.path);
    this.nodes.push({
      id: nodeId,
      type: 'file',
      name: file.path.split('/').pop() ?? file.path,
      filePath: file.path,
      startLine: 1,
      endLine: this.countLines(file.content),
      metadata: {
        language: file.language,
      },
    });
  }

  private analyzeFile(file: FileNode, allFiles: FileNode[]): void {
    const content = file.content;
    const filePath = file.path;

    // Extract imports/exports
    this.extractImports(content, filePath, allFiles);

    // Extract functions
    this.extractFunctions(content, filePath);

    // Extract classes
    this.extractClasses(content, filePath);
  }

  private extractImports(
    content: string,
    filePath: string,
    allFiles: FileNode[],
  ): void {
    const importRegex =
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;

    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      const resolvedPath = this.resolveImportPath(importPath, filePath);
      const targetFile = allFiles.find((f) => f.path === resolvedPath);

      if (targetFile) {
        const fromId = this.getFileNodeId(filePath);
        const toId = this.getFileNodeId(resolvedPath);
        this.edges.push({
          from: fromId,
          to: toId,
          type: 'imports',
        });
      }
    }
  }

  private extractFunctions(content: string, filePath: string): void {
    const functionRegex =
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/g;

    let match: RegExpExecArray | null;
    let lineNumber = 1;
    const lines = content.split('\n');

    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1];
      const matchIndex = match.index;
      lineNumber = content.substring(0, matchIndex).split('\n').length;

      // Find end of function (simplified - looks for matching brace)
      let braceCount = 0;
      let endLine = lineNumber;
      for (let i = lineNumber - 1; i < lines.length; i++) {
        const line = lines[i];
        braceCount += (line.match(/\{/g)?.length ?? 0);
        braceCount -= (line.match(/\}/g)?.length ?? 0);
        if (braceCount === 0 && i > lineNumber - 1) {
          endLine = i + 1;
          break;
        }
      }

      const nodeId = `${this.getFileNodeId(filePath)}:function:${functionName}`;
      this.nodes.push({
        id: nodeId,
        type: 'function',
        name: functionName,
        filePath,
        startLine: lineNumber,
        endLine,
        metadata: {},
      });

      // Add edge from file to function
      this.edges.push({
        from: this.getFileNodeId(filePath),
        to: nodeId,
        type: 'references',
      });
    }
  }

  private extractClasses(content: string, filePath: string): void {
    const classRegex = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?/g;

    let match: RegExpExecArray | null;
    let lineNumber = 1;

    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const extendsClass = match[2];
      const matchIndex = match.index;
      lineNumber = content.substring(0, matchIndex).split('\n').length;

      const nodeId = `${this.getFileNodeId(filePath)}:class:${className}`;
      this.nodes.push({
        id: nodeId,
        type: 'class',
        name: className,
        filePath,
        startLine: lineNumber,
        endLine: lineNumber + 10, // Simplified
        metadata: {},
      });

      // Add edge from file to class
      this.edges.push({
        from: this.getFileNodeId(filePath),
        to: nodeId,
        type: 'references',
      });

      // Add extends edge if present
      if (extendsClass) {
        this.edges.push({
          from: nodeId,
          to: `:class:${extendsClass}`, // Simplified - would need proper resolution
          type: 'extends',
        });
      }
    }
  }

  private resolveImportPath(importPath: string, fromPath: string): string {
    // Simplified resolution - would need proper module resolution
    if (importPath.startsWith('.')) {
      const dir = fromPath.substring(0, fromPath.lastIndexOf('/'));
      return `${dir}/${importPath.replace(/^\.\//, '')}`;
    }
    return importPath;
  }

  private getFileNodeId(path: string): string {
    return `file:${path}`;
  }

  private countLines(content: string): number {
    return content.split('\n').length;
  }
}
