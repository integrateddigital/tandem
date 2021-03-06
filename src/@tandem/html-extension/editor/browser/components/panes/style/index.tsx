import React =  require("react");
import { Workspace } from "@tandem/editor/browser/stores";
import { HTMLDOMElements } from "@tandem/html-extension/collections";
import { BaseApplicationComponent } from "@tandem/common";
import { SyntheticHTMLElement } from "@tandem/synthetic-browser";
import { ApplyFileEditRequest } from "@tandem/sandbox";
import { HashInputComponent } from "@tandem/html-extension/editor/browser/components/common";
import { CSSStylePaneComponent } from "../css";

export class HTMLStylePaneComponent extends BaseApplicationComponent<{ workspace: Workspace }, any> {

  setDeclaration = (name: string, value: string, oldName?: string) => {
    for (const element of this.items) {
      const style = element.style;
      style[name] = value;
      if (oldName) {
        style[oldName] = undefined;
      }
      const edit = element.createEdit();
      edit.setAttribute("style", element.getAttribute("style"));
      this.props.workspace.applyFileMutations(edit.mutations);
    }
  }

  get items(): HTMLDOMElements {
    return HTMLDOMElements.fromArray(this.props.workspace.selection);
  }

  render() {
    const { workspace } = this.props;
    if (!workspace) return null;
    const items = this.items;
    if (!items.length || !items.style.length) return null;
    return <CSSStylePaneComponent style={items.style} title="Style" titleClassName="entity html property" setDeclaration={this.setDeclaration} />;
  }
}