declare module "jssoup" {
  export class SoupElement {
    constructor(parent?: any, previousElement?: any, nextElement?: any);
    parent: any;
    previousElement: any;
    nextElement: any;
    get nextSibling(): any;
    get previousSibling(): any;
    get nextSiblings(): any;
    get previousSiblings(): any;
    extract(): void;
    insert(index: any, newElement: any): void;
    replaceWith(newElement: any): SoupElement;
  }

  export class SoupTag extends SoupElement {
    constructor(
      name: any,
      builder: any,
      attrs?: any,
      parent?: any,
      previousElement?: any,
      nextElement?: any
    );
    name: any;
    contents: any[];
    attrs: any;
    hidden: boolean;
    builder: any;
    _append(child: any): void;
    _build(children: any): SoupTag;
    _transform(dom: any): SoupTag | SoupString | SoupComment;
    get string(): any;
    find(name?: any, attrs?: any, string?: any): any;
    findAll(name?: any, attrs?: any, string?: any): any[];
    findPreviousSibling(name?: any, attrs?: any, string?: any): any;
    findPreviousSiblings(name?: any, attrs?: any, string?: any): any[];
    findNextSibling(name?: any, attrs?: any, string?: any): any;
    findNextSiblings(name?: any, attrs?: any, string?: any): any[];
    getText(separator?: string): string;
    get text(): string;
    get descendants(): any[];
    _convertAttrsToString(): string;
    _prettify(indent: any, breakline: any, level?: number): string;
    prettify(indent?: string, breakline?: string): string;
    append(item: any): void;
    _isEmptyElement(): boolean;
    select(expression: any): any;
    selectOne(expression: any): any;
  }

  export default class JSSoup extends SoupTag {
    constructor(text: any, ignoreWhitespace?: boolean);
  }

  export class SoupString extends SoupElement {
    constructor(text: any, parent?: any, previousElement?: any, nextElement?: any);
    _text: any;
    toString(): any;
  }
  export class SoupComment extends SoupElement {
    constructor(text: any, parent?: any, previousElement?: any, nextElement?: any);
    _text: any;
  }

  export class TreeBuilder {
    EMPTY_ELEMENT_TAGS: any;
    canBeEmptyElement(name: any): any;
  }

  export class JSSoupAdapter {
    descendants(domElement: any): any;
    children(domElement: any): any;
    nextSibling(domElement: any): any;
    nextSiblings(domElement: any): any;
    elementName(domElement: any): any;
    attributes(domElement: any): any;
    name(domElement: any): any;
    isTagElement(domElement: any): boolean;
  }
}
