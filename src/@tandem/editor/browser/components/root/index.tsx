import "./index.scss";

import React =  require("react");
import { EditorStore } from "@tandem/editor/browser/stores";
import { EditorRouteNames } from "@tandem/editor/browser/constants";
import { EditorStoreProvider } from "@tandem/editor/browser/providers";
import { PageOutletComponent } from "@tandem/editor/browser/components/common";
import { Kernel, RootApplicationComponent, BaseApplicationComponent, inject, Status } from "@tandem/common";

export class MainComponent extends BaseApplicationComponent<{}, {}> {

  @inject(EditorStoreProvider.ID)
  private _store: EditorStore;

  render() {
    return <div className="td-main">  
      { this.renderPage() }
      { this._store.popups.map((render, i) => {
        return render({ key: i });
      })}
    </div>;
  }

  renderPage() {
    const status = this._store.status;
    if (status.type === Status.LOADING) {
      return <div className="loading">
      </div>;
    } else if (status.type === Status.COMPLETED) {
      return <PageOutletComponent routeName={EditorRouteNames.ROOT}  />;
    }
  }
}

// prop injection doesn't exist in the root application component, so render
export class RootComponent extends RootApplicationComponent {
  render() {
    return <MainComponent />;
  }
}

