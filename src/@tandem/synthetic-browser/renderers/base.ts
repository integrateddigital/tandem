import { Action } from "@tandem/common";
import { WrapBus } from "mesh";
import { BoundingRect, watchProperty } from "@tandem/common";
import {
  MarkupNodeType,
  SyntheticDocument,
  SyntheticMarkupNode,
  SyntheticMarkupText,
  SyntheticMarkupElement,
  SyntheticCSSStyleDeclaration,
} from "../dom";


export interface ISyntheticDocumentRenderer {
  readonly element: HTMLElement;
  target: SyntheticMarkupNode;
}

export abstract class BaseRenderer implements ISyntheticDocumentRenderer {

  readonly element: HTMLElement;
  private _target: SyntheticDocument;
  private _updating: boolean;
  private _shouldUpdateAgain: boolean;

  constructor() {
    this.element = document.createElement("div");
  }

  get target(): SyntheticDocument {
    return this._target;
  }

  set target(value: SyntheticDocument) {
    this._target = value;
    this._target.observe(new WrapBus(this.onTargetChange.bind(this)));
    this.update();
  }

  abstract update();

  protected onTargetChange(action: Action) {
    if (this._updating) {
      this._shouldUpdateAgain = true;
      return;
    }
    this._updating = true;
    requestAnimationFrame(() => {
      this.update();
      this._updating = false;
      if (this._shouldUpdateAgain) {
        this._shouldUpdateAgain = false;
        this.update();
      }
    });
  }
}