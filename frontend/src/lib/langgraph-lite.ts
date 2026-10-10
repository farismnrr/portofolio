type AnnotationDescriptor<T> = { readonly __value?: T };
type StateFromShape<T extends Record<string, AnnotationDescriptor<unknown>>> = {
  [K in keyof T]: T[K] extends AnnotationDescriptor<infer V> ? V : never;
};

type RootDefinition<S> = {
  readonly State: S;
};

type Node<S> = (state: S) => Partial<S> | Promise<Partial<S>>;
type GraphPoint = string | symbol;

interface AnnotationFactory {
  <T>(): AnnotationDescriptor<T>;
  Root<T extends Record<string, AnnotationDescriptor<unknown>>>(shape: T): RootDefinition<StateFromShape<T>>;
}

const annotationFactory = (<T>() => ({} as AnnotationDescriptor<T>)) as AnnotationFactory;
annotationFactory.Root = <T extends Record<string, AnnotationDescriptor<unknown>>>(_shape: T) =>
  ({ State: undefined as unknown as StateFromShape<T> });

export const Annotation = annotationFactory;
export const START = Symbol('START');
export const END = Symbol('END');

export class StateGraph<S> {
  private readonly nodes = new Map<string, Node<S>>();
  private readonly edges = new Map<GraphPoint, GraphPoint>();

  constructor(_definition: RootDefinition<S>) {}

  addNode(name: string, node: Node<S>) {
    this.nodes.set(name, node);
    return this;
  }

  addEdge(from: GraphPoint, to: GraphPoint) {
    this.edges.set(from, to);
    return this;
  }

  compile() {
    const nodes = this.nodes;
    const edges = this.edges;

    return {
      async invoke(initial: Partial<S>) {
        let state = { ...initial } as S;
        let cursor: GraphPoint = START;
        const visited = new Set<GraphPoint>();

        while (true) {
          const next = edges.get(cursor);
          if (next === undefined) throw new Error(`Workflow edge missing after ${String(cursor)}`);
          if (next === END) return state;
          if (visited.has(next)) throw new Error(`Workflow cycle detected at ${String(next)}`);
          visited.add(next);

          if (typeof next !== 'string') throw new Error('Workflow node name must be a string');
          const node = nodes.get(next);
          if (!node) throw new Error(`Workflow node not found: ${next}`);

          state = { ...state, ...(await node(state)) };
          cursor = next;
        }
      }
    };
  }
}
