import type { Container } from 'pixi.js';

/** Grupo de objetos reutilizables: nada se crea ni se destruye por cuadro (BUGS B-013). */
export class Pool<T extends Container> {
  private items: T[] = [];
  private used = 0;
  constructor(
    private readonly parent: Container,
    private readonly make: () => T,
  ) {}
  begin() {
    this.used = 0;
  }
  next(): T {
    let item = this.items[this.used];
    if (!item) {
      item = this.make();
      this.items.push(item);
      this.parent.addChild(item);
    }
    item.visible = true;
    this.used++;
    return item;
  }
  end() {
    for (let i = this.used; i < this.items.length; i++) this.items[i]!.visible = false;
  }
}
